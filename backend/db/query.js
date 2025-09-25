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

module.exports = {
  findUser,
  createUser,
  createRefreshToken,
  invalidateRefreshToken,
};
