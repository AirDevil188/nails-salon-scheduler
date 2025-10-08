const {
  createHashedPassword,
  generateRefreshToken,
} = require("../utils/utils");
const express = require("express");
const request = require("supertest");
const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");

const prisma = new PrismaClient();

const userRouter = require("../routes/userRouter");
const { addHours } = require("date-fns/addHours");

const mockEmit = jest.fn();
// Spy on the .to() call and ensure it returns an object with the mockEmit function
const mockTo = jest.fn(() => ({ emit: mockEmit }));

// Tell Jest to replace the actual socketManager module
jest.mock("../socket/services/socketManager.js", () => ({
  // When the controller calls getIo(), it receives an object containing our 'to' spy
  getIo: jest.fn(() => ({ to: mockTo })),
}));

// mock the cloudinary so that we can use uploader.destroy
jest.mock("../config/cloudinary.js", () => ({
  utils: {
    api_sign_request: jest.fn(() => "mocked_signature_432"),
  },
  uploader: {
    destroy: jest.fn((publicId, cb) => {
      // simulate success
      cb(null, { result: "ok" });
    }),
  },
}));

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
  avatar: "nails_salon_scheduler/avatars/111_old_avatar",
};

let accessToken;
let testInvitation;
let user;
const signUpTestEmail = "testing@email.com";

beforeEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.$disconnect();
});

beforeAll(async () => {
  await prisma.$connect();

  await prisma.token.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.user.deleteMany({});

  // hash the password
  const hashedPassword = await createHashedPassword(testUser.password);

  user = await prisma.user.create({
    data: {
      email: testUser.email,
      password: hashedPassword,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      role: testUser.role,
      avatar: testUser.avatar,
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

  test("should fetch user profile", async () => {
    const expectedPayload = {
      email: "test@email.com",
      first_name: "Test",
      last_name: "Test",
      avatar: testUser.avatar,
    };
    const res = await request(app)
      .get("/users/profile")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.profile).toBeDefined();
    expect(res.body.profile).toEqual(expectedPayload);
  });

  test("should throw 401 err if the  unauthenticated user tries to fetch a profile", async () => {
    const res = await request(app).get("/users/profile").expect(401);
  });

  test("should update the profile first name", async () => {
    const res = await request(app)
      .patch("/users/profile")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        first_name: "Kengur",
      })
      .expect(200);

    expect(mockTo).toHaveBeenCalledTimes(2);
    expect(res.body.profile.first_name).toEqual("Kengur");

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");
    expect(mockEmit.mock.calls[0][0]).toBe("admin:userProfileUpdated");
    expect(mockEmit.mock.calls[0][1]).toEqual({
      email: res.body.profile.email,
      id: res.body.profile.id,
    });

    expect(mockTo.mock.calls[1][0]).toBe(`user:${res.body.profile.id}`);
    expect(mockEmit.mock.calls[1][0]).toBe("user:userProfileUpdated");
    expect(mockEmit.mock.calls[1][1]).toEqual(res.body);
  });

  test("should fetch old public ID, update it with new ID and call uploader.destroy for cleanup", async () => {
    const newPublicId = `nails_salon_scheduler/avatars/999_new_avatar`;

    expect(user.avatar).toBe(testUser.avatar);

    const res = await request(app)
      .post("/users/profile/avatar")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .send({
        publicId: newPublicId,
      })
      .expect(200);
    expect(res.body.avatar.avatar).toBe(newPublicId);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(1);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      testUser.avatar,
      expect.any(Function) // Checks it was called with the cleanup callback
    );

    expect(mockTo).toHaveBeenCalledTimes(2);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");
    expect(mockEmit.mock.calls[0][0]).toBe("admin:userAvatarUpdated");
    expect(mockEmit.mock.calls[0][1]).toEqual(newPublicId);

    expect(mockTo.mock.calls[1][0]).toBe(`user:${user.id}`);
    expect(mockEmit.mock.calls[1][0]).toBe("user:userAvatarUpdated");
    expect(mockEmit.mock.calls[1][1]).toEqual(newPublicId);
  });

  test("should update new ID but NOT call cloudinary destroy if no old avatar exists", async () => {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: null,
      },
    });
    const newPublicId = "nails_salon_scheduler/avatars/999_avatar_NEW";

    await request(app)
      .post("/users/profile/avatar")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ publicId: newPublicId })
      .expect(200);

    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();

    expect(mockTo).toHaveBeenCalledTimes(2);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");
    expect(mockEmit.mock.calls[0][0]).toBe("admin:userAvatarUpdated");
    expect(mockEmit.mock.calls[0][1]).toEqual(newPublicId);

    expect(mockTo.mock.calls[1][0]).toBe(`user:${user.id}`);
    expect(mockEmit.mock.calls[1][0]).toBe("user:userAvatarUpdated");
    expect(mockEmit.mock.calls[1][1]).toEqual(newPublicId);
  });

  test("should throw a 400 err if publicId is not provided", async () => {
    await request(app)
      .post("/users/profile/avatar")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(mockTo).not.toHaveBeenCalled();
  });

  test("should throw 401 err if the user password doesn't match with current password", async () => {
    const res = await request(app)
      .patch("/users/profile/change-password")
      .send({
        current_password: "Test1234!!",
        new_password: "Kengur123!",
      })
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(401);
  });

  test("should change user password", async () => {
    const res = await request(app)
      .patch("/users/profile/change-password")
      .send({
        current_password: "Test1234!",
        new_password: "Kengur123!",
      })
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(204);
  });

  test("should delete a user profile", async () => {
    const res = await request(app)
      .delete("/users/profile")
      .set(`Authorization`, `Bearer ${accessToken}`)
      .expect(204);

    expect(mockTo.mock.calls[0][0]).toBe("admin-dashboard");

    // Check event name
    expect(mockEmit.mock.calls[0][0]).toBe("admin:userDeleted");
    expect(mockEmit.mock.calls[0][1]).toBe(user.id);
  });
});
