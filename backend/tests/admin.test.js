const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

const adminRouter = require("../routes/adminRouter");
const userRouter = require("../routes/userRouter");
const { createHashedPassword } = require("../utils/utils");

const app = express();

app.use(express.json());

app.use("/users", userRouter);
app.use("/admin", adminRouter);

// users test objects

let accessToken;
const adminPassword = "Admin123!";

afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});

  await prisma.$disconnect();
});

beforeAll(async () => {
  await prisma.$connect();

  await prisma.user.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});

  const hashedPassword = await createHashedPassword(adminPassword);

  // push users to the db
  const testAdmin = await prisma.user.create({
    data: {
      email: "testadmins@email.com",
      password: hashedPassword,
      first_name: "Admin",
      last_name: "Admin",
      role: "admin",
    },
  });
  const fakeUsers = Array.from({ length: 10 }).map(async (_, i) => {
    const hashedPassword = await createHashedPassword(
      faker.internet.password({ length: 8 })
    );
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: hashedPassword,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        role: "user",
      },
    });

    return user;
  });
  await Promise.all(fakeUsers);

  const res = await request(app)
    .post("/users/sign-in")
    .send({ email: testAdmin.email, password: adminPassword })
    .expect(200);

  accessToken = res.body.accessToken;
});

describe("GET /admin", () => {
  test("should fetch all of the users in the db", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set(`Authorization`, `Bearer ${accessToken}`)

      .expect(200);

    expect(res.body.users).toBeDefined();
    expect(res.body.users).toHaveLength(10);
  });
});
