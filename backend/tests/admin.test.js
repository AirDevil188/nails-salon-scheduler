const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const mockEmit = jest.fn();
// Spy on the .to() call and ensure it returns an object with the mockEmit function
const mockTo = jest.fn(() => ({ emit: mockEmit }));

// Tell Jest to replace the actual socketManager module
jest.mock("../socket/services/socketManager.js", () => ({
  // When the controller calls getIo(), it receives an object containing our 'to' spy
  getIo: jest.fn(() => ({ to: mockTo })),
}));

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
let appointment;
const now = new Date();

afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});

  await prisma.$disconnect();
});

beforeEach(async () => {
  jest.clearAllMocks();
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

  appointment = await prisma.appointment.create({
    data: {
      title: "Generic Title",
      userId: users[5].id,
      startDateTime: new Date(),
      endDateTime: addMinutes(new Date(), 30),
      status: "scheduled",
    },
  });
  console.error(appointment);

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

  test("should get all appointments in october", async () => {
    const res = await request(app)
      .get("/admin/appointments/calendar?month=2025-10-01T12:00:00.000Z")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.appointments).toHaveLength(51);
  });

  test("admin should delete the user", async () => {
    const userId = users[1].id;
    const res = await request(app)
      .delete(`/admin/users/${userId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(204);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");
    expect(mockTo.mock.calls[1][0]).toBe(`user:${userId}`);

    expect(mockEmit.mock.calls[0][0]).toBe("admin:userDeleted");
    expect(mockEmit.mock.calls[0][1]).toBe(userId);

    expect(mockEmit.mock.calls[1][0]).toBe("user:deleted");
    expect(mockEmit.mock.calls[1][1]).toBe(userId);
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

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    expect(mockEmit.mock.calls[0][0]).toBe("admin:invitationDelete");
    expect(mockEmit.mock.calls[0][1]).toBe(invitationId);
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

    expect(res.body.appointments).toHaveLength(50);
  });

  test("should add the appointment", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Generic Title",
        status: "scheduled",
        startDateTime: "2050-10-30T08:00:00.000Z",
        endDateTime: "2050-10-30T09:00:00.000Z",
        userId: `${users[5].id}`,
      })
      .expect(201)
      .set(`Authorization`, `Bearer ${accessToken}`);

    // --- ASSERT SOCKET.IO CALLS ---
    expect(mockTo).toHaveBeenCalledTimes(2);

    // --- ASSERT THE ADMIN BROADCAST (Call Index 2) ---

    // Check room name
    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    // Check event name
    expect(mockEmit.mock.calls[0][0]).toBe("admin:appointment:created");

    const expectedUserRoom = `user:${users[5].id}`;

    // Check room name
    expect(mockTo.mock.calls[1][0]).toBe(expectedUserRoom);

    // Check event name
    expect(mockEmit.mock.calls[1][0]).toBe("appointment:created");
    expect(mockEmit.mock.calls[1][1].startDateTime).toBeInstanceOf(Date);
  });

  test("should display validation error for the title field", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        status: "scheduled",
        startDateTime: "2050-10-30T08:00:00.000Z",
        endDateTime: "2050-10-30T09:00:00.000Z",
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
        startDateTime: "2050-10-05T08:00:00.000Z",
        endDateTime: "2050-10-05T09:00:00.000Z",
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
        startDateTime: "2050-10-05T08:00:00.000Z",
        endDateTime: "2050-10-05T09:00:00.000Z",
      })
      .expect(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("statusErrMessage");
    expect(res.body.validationDetails).toBeInstanceOf(Array);
    expect(res.body.validationDetails[0]).toBe(
      "ID klijenta (userId) je obavezan za zakazivanje termina"
    );
  });

  test("should not allow custom appointment status", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Generic Title",
        startDateTime: "2050-10-05T08:00:00.000Z",
        endDateTime: "2050-10-05T09:00:00.000Z",
        userId: `${users[5].id}`,
        status: "ha",
      })
      .expect(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("statusErrMessage");
    expect(res.body.validationDetails).toBeInstanceOf(Array);
    expect(res.body.validationDetails[0]).toBe("Status termina nije ispravan");
  });

  test("should not allow for appointment status to be empty", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Generic Title",
        startDateTime: "2050-10-05T08:00:00.000Z",
        endDateTime: "2050-10-05T09:00:00.000Z",
        userId: `${users[5].id}`,
      })
      .expect(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("statusErrMessage");
    expect(res.body.validationDetails).toBeInstanceOf(Array);
    expect(res.body.validationDetails[0]).toBe("Status termina je obavezan");
  });

  test("should not allow for userId to be present if the external_client field is provided", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Generic Title",
        startDateTime: "2050-10-05T08:00:00.000Z",
        endDateTime: "2050-10-05T09:00:00.000Z",
        status: "scheduled",
        external_client: "James Cameron",
        userId: `${users[5].id}`,
      })
      .expect(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("statusErrMessage");
    expect(res.body.validationDetails).toBeInstanceOf(Array);
    expect(res.body.validationDetails[0]).toBe(
      "ID klijenta ne može biti prisutan, ako je eksterni klijent zadat"
    );
  });

  test("should  allow userId to be null if the external_client is provided", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Generic Title",
        startDateTime: "2050-10-05T08:00:00.000Z",
        endDateTime: "2050-10-05T09:00:00.000Z",
        status: "scheduled",
        external_client: "James Cameron",
      });
  });

  test("should delete the appointment", async () => {
    const appointmentId = appointments[3].id;
    const res = await request(app)
      .delete(`/admin/appointments/${appointmentId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(204);

    expect(mockTo).toHaveBeenCalledTimes(2);

    // Check room name
    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    // Check event name
    expect(mockEmit.mock.calls[0][0]).toBe("admin:appointment:deleted");

    const expectedUserRoom = `user:${appointments[3].userId}`;

    // Check room name
    expect(mockTo.mock.calls[1][0]).toBe(expectedUserRoom);

    // Check event name
    expect(mockEmit.mock.calls[1][0]).toBe("user:appointment:deleted");

    expect(mockEmit.mock.calls[1][1]).toBe(appointmentId);
  });

  test("should update the appointment to have a new title", async () => {
    const appointmentId = appointments[4].id;
    const res = await request(app)
      .patch(`/admin/appointments/${appointmentId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Updated Title",
      })
      .expect(200);
    expect(res.body.appointment.title).toBe("Updated Title");
    expect(res.body.appointment.external_client).toBeNull();

    expect(mockTo).toHaveBeenCalledTimes(2);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");
    expect(mockEmit.mock.calls[0][0]).toBe("admin:appointment:updated");

    const expectedUserRoom = `user:${res.body.appointment.userId}`;

    expect(mockTo.mock.calls[1][0]).toBe(expectedUserRoom);

    expect(mockEmit.mock.calls[1][0]).toBe("user:appointment:updated");

    expect(mockEmit.mock.calls[0][1].title).toBe("Updated Title");
    expect(mockEmit.mock.calls[0][1].userId).toBe(res.body.appointment.userId);
    expect(mockEmit.mock.calls[0][1].startDateTime).toBeInstanceOf(Date);
    expect(mockEmit.mock.calls[0][1].endDateTime).toBeInstanceOf(Date);
    expect(mockEmit.mock.calls[0][1].createdAt).toBeInstanceOf(Date);
    expect(mockEmit.mock.calls[0][1].updatedAt).toBeInstanceOf(Date);
  });

  test("should update the appointment to have a new title, external_client and no userId", async () => {
    const appointmentId = appointments[7].id;
    const res = await request(app)
      .patch(`/admin/appointments/${appointmentId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "Updated Title",
        external_client: "Kate Perry",
      })
      .expect(200);
    expect(res.body.appointment.title).toBe("Updated Title");
    expect(res.body.appointment.userId).toBeNull();

    expect(mockTo).toHaveBeenCalledTimes(1);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");
    expect(mockEmit.mock.calls[0][0]).toBe("admin:appointment:updated");

    expect(mockEmit.mock.calls[0][1].title).toBe("Updated Title");
    expect(mockEmit.mock.calls[0][1].external_client).toBe("Kate Perry");
    expect(mockEmit.mock.calls[0][1].startDateTime).toBeInstanceOf(Date);
    expect(mockEmit.mock.calls[0][1].endDateTime).toBeInstanceOf(Date);
    expect(mockEmit.mock.calls[0][1].createdAt).toBeInstanceOf(Date);
    expect(mockEmit.mock.calls[0][1].updatedAt).toBeInstanceOf(Date);
  });

  test("should cancel the appointment", async () => {
    const appointmentId = appointment.id;
    const res = await request(app)
      .post(`/admin/appointments/${appointmentId}/cancel`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(200);

    expect(mockTo).toHaveBeenCalledTimes(2);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");
    expect(mockEmit.mock.calls[0][0]).toBe("admin:appointmentCanceled");

    expect(mockTo.mock.calls[1][0]).toBe(`user:${res.body.appointment.userId}`);
    expect(mockEmit.mock.calls[1][0]).toBe("user:appointmentCanceled");

    expect(res.body.appointment.count).toBe(1);
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
    const appointmentId = appointment.id;
    const res = await request(app)
      .post(`/admin/appointments/${appointmentId}/cancel`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(403);
  });

  test("regular user should not be able to cancel the appointment", async () => {
    const res = await request(app)
      .post("/admin/appointments/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(403);
  });
});
