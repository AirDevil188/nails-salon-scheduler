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
        invitationId: invitation,
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

const findRefreshTokenByUserId = async (userId) => {
  try {
    return prisma.token.findUnique({
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

const updateInvitationCode = async (token, code, expiresAt) => {
  try {
    return prisma.invitation.update({
      where: {
        token: token,
        invitationStatus: "pending",
      },
      data: {
        code: code,
        expiresAt: expiresAt,
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

const acceptInvitationStatus = async (token) => {
  try {
    return await prisma.invitation.update({
      where: {
        token: token,
        invitationStatus: "code_verified",
      },
      data: {
        invitationStatus: "accepted",
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const verifyInvitationStatus = async (token) => {
  try {
    return await prisma.invitation.update({
      where: {
        token: token,
        invitationStatus: "pending",
      },
      data: {
        invitationStatus: "code_verified",
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

// ADMIN queries
const adminGetAllUsers = async (userId, { limit, page, orderBy }) => {
  try {
    const pageSize = parseInt(limit, 10) || 25;
    const pageNumber = parseInt(page, 10) || 1;
    const skipCount = (pageNumber - 1) * pageSize;

    let orderCriteria = [{ createdAt: "desc" }]; // default option

    if (orderBy) {
      // split as first_name_asc
      const [field, directionOfTheOrder] = orderBy.split("_");

      // prevent injection
      if (
        ["first_name", "email", "last_name", "createdAt"].includes(field) &&
        ["asc", "desc"].includes(directionOfTheOrder)
      ) {
        // sort based on user choice
        orderCriteria = [{ [field]: directionOfTheOrder }];

        // add a string tie break
        let secondaryField = null;

        switch (field) {
          case "first_name":
          case "last_name":
            secondaryField =
              field === "first_name" ? "last_name" : "first_name";
            break;
          case "email":
            // If sorting by email, use a name field (firstName) as tie-breaker
            secondaryField = "first_name";
            break;
          case "createdAt":
            secondaryField = "email";
            break;
        }

        if (secondaryField) {
          orderCriteria.push({ [secondaryField]: "asc" });
        }
      }
    }

    const [users, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          NOT: { id: userId },
        },
        skip: skipCount,
        take: pageSize,
        orderBy: orderCriteria,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          avatar: true,
          role: true,
        },
      }),
      prisma.user.count({
        where: {
          NOT: {
            id: userId,
          },
        },
      }),
    ]);
    return { users: users, totalCount: totalCount };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const adminDeleteUser = async (userId) => {
  try {
    return await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const adminGetAllInvitations = async ({
  invitationStatus,
  limit,
  page,
  orderBy,
}) => {
  // Sanitize inputs for safety
  const pageSize = parseInt(limit, 10) || 25;
  const pageNumber = parseInt(page, 10) || 1;
  const skipCount = (pageNumber - 1) * pageSize;

  let orderCriteria = [{ createdAt: "desc" }]; // Default sort: Newest first

  if (orderBy) {
    const [field, directionOfTheOrder] = orderBy.split("_"); // split as expiresAt_desc

    if (
      ["createdAt", "expiresAt"].includes(field) &&
      ["asc", "desc"].includes(directionOfTheOrder)
    ) {
      // set the order based on user input

      orderCriteria = [{ [field]: directionOfTheOrder }];

      // Add a secondary sort to break ties (use the other field)
      const secondaryField = field === "createdAt" ? "expiresAt" : "createdAt";

      // Keep secondary sort ascending by default for clarity
      orderCriteria.push({ [secondaryField]: "asc" });
    }
  }
  const where = {};
  if (invitationStatus) {
    where.invitationStatus = invitationStatus;
  }
  try {
    // use prisma transaction to execute two queries at the same time
    const [invitations, totalCount] = await prisma.$transaction([
      prisma.invitation.findMany({
        where: where,
        take: pageSize,
        skip: skipCount,
        orderBy: orderCriteria,
      }),
      prisma.invitation.count({ where: where }),
    ]);
    return { invitations: invitations, totalCount: totalCount };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const adminDeleteInvitation = async (id) => {
  try {
    return await prisma.invitation.delete({
      where: {
        NOT: {
          invitationStatus: "accepted",
        },
        id: id,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const adminGetAllAppointments = async ({ status, limit, page }) => {
  const where = {};
  if (status) {
    where.status = status;
  }
  try {
    return await prisma.appointment.findMany({
      where: where,
      orderBy: { date: "asc" },
      take: limit,
      // first page (1 - 1) * 25 = skip 0
      // second page (2 - 1) * 25 = skip 25
      // third page (3 - 1) * 25 = skip 50
      // etc...
      skip: (page - 1) * limit,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  findUser,
  createUser,
  findRefreshTokenByUserId,
  createRefreshToken,
  invalidateRefreshToken,
  findInvitation,
  findInvitationByToken,
  createInvitation,
  updateInvitation,
  invalidateInvitation,
  createInvitationCode,
  updateInvitationCode,
  findInvitationCode,
  acceptInvitationStatus,
  verifyInvitationStatus,
  adminGetAllUsers,
  adminDeleteUser,
  adminGetAllAppointments,
  adminGetAllInvitations,
  adminDeleteInvitation,
};
