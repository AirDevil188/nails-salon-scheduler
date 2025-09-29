const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

const adminRouter = require("../routes/adminRouter");
const userRouter = require("../routes/userRouter");
const {
  createHashedPassword,
  generateRefreshToken,
} = require("../utils/utils");
const { addHours } = require("date-fns/addHours");

const app = express();

app.use(express.json());

app.use("/users", userRouter);
app.use("/admin", adminRouter);

// users test objects

let accessToken;
const adminPassword = "Admin123!";
let users;
let testAdmin;
let testUser;
const now = new Date();

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
  testAdmin = await prisma.user.create({
    data: {
      email: "testadmins@email.com",
      password: hashedPassword,
      first_name: "Admin",
      last_name: "Admin",
      role: "admin",
    },
  });

  testUser = await prisma.user.create({
    data: {
      email: "testuser3@email.com",
      password: hashedPassword,
      first_name: "Test",
      last_name: "Test",
      role: "user",
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

  users = await Promise.all(fakeUsers);

  const fakeInvitations = Array.from({ length: 5 }).map(async (_, i) => {
    const generateRawToken = generateRefreshToken();
    const invitation = await prisma.invitation.create({
      data: {
        email: faker.internet.email(),
        token: generateRawToken,
        invitationStatus: "pending",
        expiresAt: addHours(now, 8),
      },
    });
    return invitation;
  });

  await Promise.all(fakeInvitations);

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
    expect(res.body.users).toHaveLength(11);
  });

  test("admin should delete the user", async () => {
    const userId = users[1].id;
    const res = await request(app)
      .delete(`/admin/users/${userId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(204);
  });

  test("should fetch all of the invitations in the db", async () => {
    const res = await request(app)
      .get("/admin/invitations")
      .set(`Authorization`, `Bearer ${accessToken}`);
    expect(200);

    expect(res.body.invitations).toBeDefined();
    expect(res.body.invitations).toHaveLength(5);
  });

  test("should switch logged in user from admin to the regular user", async () => {
    const res = await request(app)
      .post("/users/sign-in")
      .send({ email: testUser.email, password: adminPassword })
      .expect(200);

    accessToken = res.body.accessToken;
  });

  test("regular user should not be able to delete other users", async () => {
    const userId = users[3].id;
    const res = await request(app)
      .delete(`/admin/users/${userId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(403);
  });

  test("regular user should not be able to see the invitations of the other users", async () => {
    const res = await request(app)
      .get("/admin/invitations")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(403);
  });
});
