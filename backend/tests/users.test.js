const {
  createHashedPassword,
  generateRefreshToken,
} = require("../utils/utils");
const express = require("express");
const request = require("supertest");
const { execSync } = require("child_process");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const userRouter = require("../routes/userRouter");
const { addHours } = require("date-fns/addHours");

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
let testInvitation;
const signUpTestEmail = "testing@email.com";

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

  // create invitation
  const invitationToken = generateRefreshToken();
  const now = new Date();
  testInvitation = await prisma.invitation.create({
    data: {
      token: invitationToken,
      email: signUpTestEmail,
      expiresAt: addHours(now, 8),
      invitationStatus: "code_verified",
    },
  });
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

  test("should give error 401 if the password is not correct", async () => {
    await request(app)
      .post("/users/sign-in")
      .send({ email: testUser.email, password: "WrongPassword123!" })
      .expect(401);
  });

  test("should give error 401 if the email is non existent", async () => {
    await request(app)
      .post("/users/sign-in")
      .send({ email: "wrong@email.com", password: testUser.password })
      .expect(401);
  });
});

describe("POST /users/sign-up", () => {
  test("should successfully create a new user with a valid invitation", async () => {
    const res = await request(app)
      .post("/users/sign-up")
      .send({
        email: testInvitation.email,
        password: testUser.password,
        confirm_password: testUser.password,
        first_name: "Test",
        last_name: "Test",
        invitationToken: testInvitation.token,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.expiresAt).toBeDefined();
  });
});
