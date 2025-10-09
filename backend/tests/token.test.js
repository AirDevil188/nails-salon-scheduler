const {
  createHashedPassword,
  generateRefreshToken,
} = require("../utils/utils");
const express = require("express");
const request = require("supertest");
const mockEmit = jest.fn();
// Spy on the .to() call and ensure it returns an object with the mockEmit function
const mockTo = jest.fn(() => ({ emit: mockEmit }));

// Tell Jest to replace the actual socketManager module
jest.mock("../socket/services/socketManager.js", () => ({
  // When the controller calls getIo(), it receives an object containing our 'to' spy
  getIo: jest.fn(() => ({ to: mockTo })),
}));

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

const MOCK_PUSH_TOKEN = "ExponentPushToken[mocked-device-id-1234]";
let accessToken;
let invitation;
let mockVerificationCode;
let verifiedInvitation;

beforeEach(async () => {
  jest.clearAllMocks();
});

beforeAll(async () => {
  await prisma.$connect();

  await prisma.invitation.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.expoPushToken.deleteMany({});
  await prisma.user.deleteMany({});

  const generateRawToken = generateRefreshToken();
  const hashedPassword = await createHashedPassword(testUser.password);
  const now = new Date();

  await prisma.user.create({
    data: {
      email: testUser.email,
      password: hashedPassword,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      role: testUser.role,
    },
  });

  verifiedInvitation = await prisma.invitation.create({
    data: {
      email: "test5@email.com",
      token: generateRawToken,
      expiresAt: addHours(now, 8),
      invitationStatus: "code_verified",
      code: 123456,
    },
  });

  const res = await request(app)
    .post("/users/sign-in")
    .send({ email: testUser.email, password: testUser.password })
    .expect(200);

  accessToken = res.body.accessToken;
});

afterAll(async () => {
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.expoPushToken.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.$disconnect();
});

describe("POST /invitations", () => {
  test("should successfully generate a new invitation link", async () => {
    const res = await request(app)
      .post("/invitations/generate")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("X-Push-Token", MOCK_PUSH_TOKEN)
      .send({ email: "testing3@email.com" })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.invitationLink).toBeDefined();

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    expect(mockEmit.mock.calls[0][0]).toBe("admin:createdInvitation");

    expect(mockEmit.mock.calls[0][1]).toEqual({
      email: res.body.invitationLink.email,
      id: res.body.invitationLink.id,
    });

    invitation = res.body.invitationLink;
    console.error(invitation);
  });
  test("should successfully test validation of the token", async () => {
    const res = await request(app)
      .post("/invitations/validate-token")
      .send({ token: invitation.token })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.invitationToken).toBe(invitation.token);
    expect(res.body.code).toBeDefined();

    expect(mockTo).toHaveBeenCalledTimes(1);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    expect(mockEmit.mock.calls[0][0]).toBe("admin:invitationCodeCreated");

    expect(mockEmit.mock.calls[0][1]).toEqual({
      email: res.body.invitation.email,
      id: res.body.invitation.id,
    });
    mockVerificationCode = res.body.code;
  });
  test("should redirect if the invitation status is code_verified", async () => {
    const res = await request(app)
      .post("/invitations/validate-token")
      .send({
        token: verifiedInvitation.token,
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.redirect).toBe(true);
    expect(res.body.invitationToken).toBe(verifiedInvitation.token);
  });
  test("should resend a new verification code", async () => {
    const res = await request(app)
      .post("/invitations/resend-verification-code")
      .send({ token: invitation.token })
      .expect(200);
    mockVerificationCode = res.body.code;

    expect(mockTo).toHaveBeenCalledTimes(1);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    expect(mockEmit.mock.calls[0][0]).toBe("admin:codeResend");

    expect(mockEmit.mock.calls[0][1]).toEqual({
      email: res.body.invitation.email,
      id: res.body.invitation.id,
    });
  });
  test("should verify verification code", async () => {
    const res = await request(app)
      .post("/invitations/validate-verification-code")
      .send({ code: mockVerificationCode, token: invitation.token })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.email).toBeDefined();

    expect(mockTo).toHaveBeenCalledTimes(1);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    expect(mockEmit.mock.calls[0][0]).toBe("admin:invitationVerified");

    expect(mockEmit.mock.calls[0][1]).toEqual({
      email: res.body.email,
      id: res.body.id,
    });
  });
  test("should throw err 401 if the code is wrong", async () => {
    const res = await request(app)
      .post("/invitations/validate-verification-code")
      .send({
        code: 111111,
        token: invitation.token,
      })
      .expect(401);
  });
});
