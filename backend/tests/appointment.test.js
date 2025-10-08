const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const mockEmit = jest.fn();

// spy on the .to() call and ensure it returns an object with mockEmit function
const mockTo = jest.fn(() => ({ emit: mockEmit }));

// Tell the Jest to replace the actual socketManager module
jest.mock("../socket/services/socketManager.js", () => ({
  // When the controller calls getIo(), it receives an object containing our 'to' spy
  getIo: jest.fn(() => ({ to: mockTo })),
}));

const prisma = new PrismaClient();

const adminRouter = require("../routes/adminRouter");
const userRouter = require("../routes/userRouter");
const appointmentRouter = require("../routes/appointmentRouter");
const {
  createHashedPassword,
  generateRefreshToken,
} = require("../utils/utils");
const { addHours } = require("date-fns/addHours");
const { addMinutes } = require("date-fns/addMinutes");
const errorHandler = require("../middlewares/errorHandler");

const app = express();

app.use(express.json());

app.use("/users", userRouter);
app.use("/admin", adminRouter);
app.use("/appointments", appointmentRouter);

let accessToken;
const adminPassword = "Admin123!";
let users;
let testAdmin;
let testUser;
let invitations;
let appointments;
const now = new Date();

afterAll(async () => {
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.$disconnect();
});

beforeEach(async () => {
  jest.clearAllMocks();
});

beforeAll(async () => {
  await prisma.$connect();

  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.user.deleteMany({});

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

  const userData = Array.from({ length: 50 }).map((_, i) => ({
    email: faker.internet.email(),
    password: hashedPassword,
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    role: "user",
  }));

  users = await prisma.user.createManyAndReturn({
    data: userData,
  });

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

  invitations = await Promise.all(fakeInvitations);

  const appointmentStatuses = ["no_show", "completed", "canceled", "scheduled"];

  const appointmentData = Array.from({ length: 50 }).map((_, i) => ({
    userId: testUser.id,
    title: "Test title",
    status:
      appointmentStatuses[Math.floor(Math.random() * appointmentStatuses)],
    startDateTime: new Date(),
    endDateTime: addMinutes(new Date(), 30),
  }));

  appointments = await prisma.appointment.createManyAndReturn({
    data: appointmentData,
  });

  const res = await request(app)
    .post("/users/sign-in")
    .send({ email: testUser.email, password: adminPassword })
    .expect(200);

  accessToken = res.body.accessToken;
});

describe("appointments router", () => {
  test("it should get all appointments in october", async () => {
    const res = await request(app)
      .get("/appointments/calendar?month=2025-10-01T12:00:00.000Z")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.appointments).toHaveLength(50);
  });

  test("should get appointment detail", async () => {
    const appointmentId = appointments[3].id;
    const res = await request(app)
      .get(`/appointments/${appointmentId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.appointment).toBeDefined();
    expect(res.body.appointment.userId).toBe(testUser.id);
  });

  test("should get only the first 25 appointments", async () => {
    const res = await request(app)
      .get("/appointments")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.appointments).toHaveLength(25);
  });

  test("should throw 401 err on /appointments  route because the user is not signed-in", async () => {
    const res = await request(app).get("/appointments").expect(401);
  });

  test("should thor 401 err on appointments detail route because the user is not signed in", async () => {
    const appointmentId = appointments[3].id;
    const res = await request(app)
      .get(`/appointments/${appointmentId}`)
      .expect(401);
  });
});
