const { createHashedPassword } = require("../utils/utils");
const express = require("express");
const request = require("supertest");
const { execSync } = require("child_process");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const userRouter = require("../routes/userRouter");

const app = express();
app.use(express.json());

app.use("/users", userRouter);

const testUser = {
  email: "test@email.com",
  password: "Test1234!",
  confirm_password: "Test1234!",
  first_name: "Test",
  last_name: "Test",
  role: "user",
};

let accessToken;

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: testUser.email },
  });

  // hash the password
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
});

afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.token.deleteMany({});

  await prisma.$disconnect();
});

describe("POST /users/sign-in", () => {
  test("should successfully log in the user and return the token", async () => {
    const res = await request(app)
      .post("/users/sign-in")
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.success).toBe(true);

    expect(res.body.userInfo.email).toBe(testUser.email);
    expect(res.body.accessToken).toBeDefined();

    accessToken = res.body.accessToken;
  });
});
