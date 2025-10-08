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
let note;
const now = new Date();

afterAll(async () => {
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.$disconnect();
});

beforeEach(async () => {
  jest.clearAllMocks();
});

beforeAll(async () => {
  await prisma.$connect();

  // await prisma.user.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.note.deleteMany({});
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

  note = await prisma.note.create({
    data: {
      title: "Test Note",
      content: "Hello World",
      userId: testAdmin.id,
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

  const res = await request(app)
    .post("/users/sign-in")
    .send({ email: testAdmin.email, password: adminPassword })
    .expect(200);

  accessToken = res.body.accessToken;
});

describe("Test Note router", () => {
  test("should add new note", async () => {
    const res = await request(app)
      .post("/admin/notes/new")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        title: "New Note",
        content: "Hello There",
      })
      .expect(200);

    expect(res.body.note).toBeDefined();

    expect(mockTo).toHaveBeenCalledTimes(1);

    // Check room name
    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    // Check event name
    expect(mockEmit.mock.calls[0][0]).toBe("admin:noteCreated");
    expect(mockEmit.mock.calls[0][1].title).toBe("New Note");
    expect(mockEmit.mock.calls[0][1].content).toBe("Hello There");
    expect(mockEmit.mock.calls[0][1].createdAt).toBeInstanceOf(Date);
    expect(mockEmit.mock.calls[0][1].updatedAt).toBeInstanceOf(Date);
  });

  test("should update the note", async () => {
    const noteId = note.id;
    const res = await request(app)
      .patch(`/admin/notes/${noteId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({ title: "Updated Title", content: "Rich Text" })
      .expect(200);

    expect(mockTo).toHaveBeenCalledTimes(1);

    // Check room name
    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    // Check event name
    expect(mockEmit.mock.calls[0][0]).toBe("admin:noteUpdated");
    expect(mockEmit.mock.calls[0][1].title).toBe("Updated Title");
    expect(mockEmit.mock.calls[0][1].content).toBe("Rich Text");
    expect(mockEmit.mock.calls[0][1].createdAt).toBeInstanceOf(Date);
    expect(mockEmit.mock.calls[0][1].updatedAt).toBeInstanceOf(Date);
  });

  test("should delete the note", async () => {
    const noteId = note.id;
    const res = await request(app)
      .delete(`/admin/notes/${noteId}`)
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(204);

    expect(mockTo).toHaveBeenCalledTimes(1);

    // Check room name
    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    // Check event name
    expect(mockEmit.mock.calls[0][0]).toBe("admin:noteDeleted");
    expect(mockEmit.mock.calls[0][1]).toBe(noteId);
  });
});
