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

// TOKEN queries
const createRefreshToken = async (token, userId) => {
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

module.exports = {
  findUser,
  createRefreshToken,
};
