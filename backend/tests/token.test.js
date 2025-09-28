const { createHashedPassword } = require("../utils/utils");
const express = require("express");
const request = require("supertest");
const { execSync } = require("child_process");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const userRouter = require("../routes/userRouter");
const invitationRouter = require("../routes/invitationRouter");
const { addHours } = require("date-fns/addHours");

const app = express();
app.use(express.json());

app.use("/users", userRouter);

app.use("/invitations", invitationRouter);

const testUser = {
  email: "testin2g@email.com",
  password: "Test1234!",
  first_name: "Test",
  last_name: "Test",
  role: "admin",
};

let accessToken;

beforeAll(async () => {
  await prisma.invitation.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await createHashedPassword(testUser.password);

  await prisma.user.create({
    data: {
      email: testUser.email,
      password: hashedPassword,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      role: testUser.role,
    },
  });

  await prisma.$disconnect();

  const res = await request(app)
    .post("/users/sign-in")
    .send({ email: testUser.email, password: testUser.password })
    .expect(200);

  accessToken = res.body.accessToken;
});

describe("POST /invitations", () => {
  test("should successfully generate a new invitation link", async () => {
    const res = await request(app)
      .post("/invitations/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: "testing3@email.com" })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.invitationLink).toBeDefined();
  });
});
