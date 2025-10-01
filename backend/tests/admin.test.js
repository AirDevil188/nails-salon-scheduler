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
const { addMinutes } = require("date-fns/addMinutes");
const errorHandler = require("../middlewares/errorHandler");

const app = express();

app.use(express.json());

app.use("/users", userRouter);
app.use("/admin", adminRouter);

app.use(errorHandler);
// users test objects

let accessToken;
const adminPassword = "Admin123!";
let users;
let testAdmin;
let testUser;
let invitations;
let appointments;
const now = new Date();

afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});

  await prisma.$disconnect();
});

beforeAll(async () => {
  await prisma.$connect();

  await prisma.user.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});

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
    userId: users[i].id,
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
    .send({ email: testAdmin.email, password: adminPassword })
    .expect(200);

  accessToken = res.body.accessToken;
});

describe("GET /admin", () => {
  test("should fetch the first 25 users", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set(`Authorization`, `Bearer ${accessToken}`)

      .expect(200);

    expect(res.body.users).toBeDefined();
    expect(res.body.users).toHaveLength(25);
  });

  test("should fetch the first 50 users", async () => {
    const res = await request(app)
      .get("/admin/users?limit=50&page=1")
      .set(`Authorization`, `Bearer ${accessToken}`)

      .expect(200);

    expect(res.body.users).toBeDefined();
    expect(res.body.users).toHaveLength(50);
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

  test("should delete invitation", async () => {
    const invitationId = invitations[1].id;
    const res = await request(app)
      .delete(`/admin/invitations/${invitationId}`)
      .set(`Authorization`, `Bearer ${accessToken}`);
    expect(204);
  });

  test("should fetch the first 25 appointments", async () => {
    const res = await request(app)
      .get("/admin/appointments")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.appointments).toHaveLength(25);
  });

  test("should fetch 50 appointments on the second page", async () => {
    const res = await request(app)
      .get("/admin/appointments?limit=50&page=1")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.appointments).toHaveLength(49);
  });

  test("should add the appointment", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Generic Title",
        status: "scheduled",
        startDateTime: "2025-10-05T08:00:00.000Z",
        endDateTime: "2025-10-05T09:00:00.000Z",
        userId: `${users[5].id}`,
      })
      .expect(201);

    console.error(res.body);
  });

  test("should display validation error for the title field", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        status: "scheduled",
        startDateTime: "2025-10-05T08:00:00.000Z",
        endDateTime: "2025-10-05T09:00:00.000Z",
        userId: `${users[5].id}`,
      })
      .expect(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("statusErrMessage");
    expect(res.body.validationDetails).toBeInstanceOf(Array);
    expect(res.body.validationDetails[0]).toBe("Naziv termina je obavezan");
  });

  test("should display validation error for the uuid field (invalid)", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Generic Title",
        status: "scheduled",
        startDateTime: "2025-10-05T08:00:00.000Z",
        endDateTime: "2025-10-05T09:00:00.000Z",
        userId: `s`,
      })
      .expect(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("statusErrMessage");
    expect(res.body.validationDetails).toBeInstanceOf(Array);
    expect(res.body.validationDetails[0]).toBe(
      "Dati ID klijenta (userId) nije ispravan"
    );
  });

  test("should display validation error for the uuid field (required)", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Generic Title",
        status: "scheduled",
        startDateTime: "2025-10-05T08:00:00.000Z",
        endDateTime: "2025-10-05T09:00:00.000Z",
      })
      .expect(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("statusErrMessage");
    expect(res.body.validationDetails).toBeInstanceOf(Array);
    expect(res.body.validationDetails[0]).toBe(
      "ID klijenta (userId) je obavezan za zakazivanje termina"
    );
  });

  test("should delete the appointment", async () => {
    const appointmentId = appointments[3].id;
    const res = await request(app)
      .delete(`/admin/appointments/${appointmentId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(204);
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

  test("regular user should not be able to delete the invitations of the other users", async () => {
    const invitation = invitations[1].id;
    const res = await request(app)
      .delete(`/admin/invitations/${invitation}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(403);
  });

  test("regular user should not be able to view the appointments", async () => {
    const res = await request(app)
      .get("/admin/appointments?limit=50&page=1")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(403);
  });

  test("regular user should not be able to add new appointments", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(403);
  });
});
