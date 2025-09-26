const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

// USER queries

const findUser = async (email) => {
  try {
    return await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const createUser = async (
  email,
  password,
  first_name,
  last_name,
  avatar,
  invitation
) => {
  try {
    return await prisma.user.create({
      data: {
        email: email,
        password: password,
        first_name: first_name,
        last_name: last_name,
        avatar: avatar,
        invitation: invitation,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// TOKEN queries
const createRefreshToken = async (token, userId, expiresAt) => {
  try {
    return await prisma.token.create({
      data: {
        token: token,
        userId: userId,
        expiresAt: expiresAt,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};
const invalidateRefreshToken = async (userId) => {
  try {
    return prisma.token.delete({
      where: {
        userId: userId,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// INVITATION queries

const createInvitationCode = async (token, code, expiresAt) => {
  try {
    return await prisma.invitation.update({
      where: {
        token: token,
      },
      data: {
        code: code,
        codeExpiresAt: expiresAt,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const findInvitationCode = async (token, code, expiresAt) => {
  try {
    return await prisma.invitation.findUnique({
      where: {
        token: token,
        code: code,
        codeExpiresAt: {
          gte: expiresAt,
        },
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const createInvitation = async (token, email, expiresAt) => {
  try {
    return prisma.invitation.create({
      data: {
        token: token,
        email: email,
        expiresAt: expiresAt,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const updateInvitation = async (token, email, expiresAt) => {
  try {
    return await prisma.invitation.update({
      where: {
        email: email,
      },
      data: {
        token: token,
        expiresAt: expiresAt,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const invalidateInvitation = async (token) => {
  try {
    return await prisma.invitation.delete({
      where: {
        token: token,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const findInvitation = async (email) => {
  try {
    return prisma.invitation.findUnique({
      where: {
        email: email,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const findInvitationByToken = async (token) => {
  try {
    return await prisma.invitation.findUnique({
      where: {
        token: token,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  findUser,
  createUser,
  createRefreshToken,
  invalidateRefreshToken,
  findInvitation,
  findInvitationByToken,
  createInvitation,
  updateInvitation,
  invalidateInvitation,
  createInvitationCode,
  findInvitationCode,
};
