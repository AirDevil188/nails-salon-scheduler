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

module.exports = {
  findUser,
};
