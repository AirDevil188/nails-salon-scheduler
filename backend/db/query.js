const { PrismaClient } = require("@prisma/client");
const { addMinutes } = require("date-fns/addMinutes");
const { verifyHash, createHashedPassword } = require("../utils/utils");

const prisma = new PrismaClient({});

// USER queries

const updateUserOnlineStatus = async (userId, status, lastSeen) => {
  try {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        is_online: status,
        last_seen: lastSeen,
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const findUserById = async (userId) => {
  try {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        password: true,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

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

const findUserProfile = async (userId) => {
  try {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
        first_name: true,
        last_name: true,
        avatar: true,
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateUserProfile = async (userId, first_name, last_name) => {
  let updateData = {};
  try {
    if (first_name !== undefined) {
      updateData.first_name = first_name;
    }
    if (last_name !== undefined) {
      updateData.last_name = last_name;
    }
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        first_name: true,
        email: true,
        last_name: true,
        avatar: true,
        password: false,
        role: true,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const deleteUser = async (userId) => {
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

const changeUserPassword = async (userId, newPassword) => {
  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getUserAppointments = async (
  userId,
  status,
  limit,
  page,
  orderBy,
  timeScope
) => {
  const now = new Date();
  const where = { userId: userId };

  // sanitize params to prevent sql injection
  const pageSize = parseInt(limit, 10) || 25;
  const pageNumber = parseInt(page, 10) || 1;
  const skipCount = (pageNumber - 1) * pageSize;

  try {
    const validScopes = ["past", "upcoming", "all"];

    // prevent SQL injection
    const scope = validScopes.includes(timeScope) ? timeScope : "all";

    // scope time filtering logic
    if (scope === "upcoming") {
      // Future appointments first
      where.startDateTime = { gt: now };
    } else if (scope === "past") {
      // Past appointments first
      where.startDateTime = { lt: now };
    }

    // optional status filter
    if (status) {
      where.status = status;
    }

    // default sorting
    let defaultSortDirection;

    if (scope === "upcoming") {
      // Closest appointment
      defaultSortDirection = "asc";
    } else if (scope === "past") {
      defaultSortDirection = "desc";
    } else {
      defaultSortDirection = "desc";
    }

    let orderCriteria = [
      { startDateTime: defaultSortDirection }, // default
      { id: "asc" }, // tie breaker secondary field
    ];

    if (orderBy) {
      const [field, directionOfTheOrder] = orderBy.split("_"); // split by startDateTime_desc

      // sanitize prevent sql injection
      if (
        [
          "startDateTime",
          "endDateTime",
          "createdAt",
          "updatedAt",
          "title",
          "status",
        ].includes(field) &&
        ["desc", "asc"].includes(directionOfTheOrder)
      ) {
        // sort based on user selection

        orderCriteria = [{ [field]: directionOfTheOrder }];

        let secondaryField;

        // tie break
        switch (field) {
          case "startDateTime":
          case "endDateTime":
          case "createdAt":
          case "updatedAt":
            secondaryField = "id";
            break;

          case "title":
            secondaryField = "status";
            break;
        }

        orderCriteria.push({ [secondaryField]: "asc" });
        // tie breaker defense if the secondary field is not an id and if status and title are have multiple same records
        if (secondaryField !== "id") {
          orderCriteria.push({ id: "asc" });
        }
      }
    }
    const [appointments, totalCount] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: where,
        orderBy: orderCriteria,
        skip: skipCount,
        take: pageSize,
      }),
      prisma.appointment.count({
        where: where,
      }),
    ]);
    return { appointments: appointments, totalCount: totalCount };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// TOKEN queries
const createRefreshToken = async (token, userId, expiresAt) => {
  const now = new Date();
  const where = {};

  // sanitize params to prevent sql injection
  const pageSize = parseInt(limit, 10) || 25;
  const pageNumber = parseInt(page, 10) || 1;
  const skipCount = (pageNumber - 1) * pageSize;
  // initialize scope

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

const adminGetAllAppointments = async ({
  status,
  limit,
  page,
  orderBy,
  timeScope,
}) => {
  const now = new Date();
  const where = {};

  // sanitize params to prevent sql injection
  const pageSize = parseInt(limit, 10) || 25;
  const pageNumber = parseInt(page, 10) || 1;
  const skipCount = (pageNumber - 1) * pageSize;
  // initialize scope

  // sanitize time scope
  try {
    const validScopes = ["past", "upcoming", "all"];

    // prevent SQL injection
    const scope = validScopes.includes(timeScope) ? timeScope : "all";

    // scope time filtering logic
    if (scope === "upcoming") {
      // Future appointments first
      where.startDateTime = { gt: now };
    } else if (scope === "past") {
      // Past appointments first
      where.startDateTime = { lt: now };
    }

    // optional status filter
    if (status) {
      where.status = status;
    }

    // default sorting
    let defaultSortDirection;

    if (scope === "upcoming") {
      // Closest appointment
      defaultSortDirection = "asc";
    } else if (scope === "past") {
      defaultSortDirection = "desc";
    } else {
      defaultSortDirection = "desc";
    }

    let orderCriteria = [
      { startDateTime: defaultSortDirection }, // default
      { id: "asc" }, // tie breaker secondary field
    ];

    if (orderBy) {
      const [field, directionOfTheOrder] = orderBy.split("_"); // split by startDateTime_desc

      // sanitize prevent sql injection
      if (
        [
          "startDateTime",
          "endDateTime",
          "createdAt",
          "updatedAt",
          "title",
          "status",
        ].includes(field) &&
        ["desc", "asc"].includes(directionOfTheOrder)
      ) {
        // sort based on user selection

        orderCriteria = [{ [field]: directionOfTheOrder }];

        let secondaryField;

        // tie break
        switch (field) {
          case "startDateTime":
          case "endDateTime":
          case "createdAt":
          case "updatedAt":
            secondaryField = "id";
            break;

          case "title":
            secondaryField = "status";
            break;
        }

        orderCriteria.push({ [secondaryField]: "asc" });
        // tie breaker defense if the secondary field is not an id and if status and title are have multiple same records
        if (secondaryField !== "id") {
          orderCriteria.push({ id: "asc" });
        }
      }
    }
    const [appointments, totalCount] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: where,
        orderBy: orderCriteria,
        skip: skipCount,
        take: pageSize,
      }),
      prisma.appointment.count({
        where: where,
      }),
    ]);
    return { appointments: appointments, totalCount: totalCount };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const adminNewAppointment = async (
  title,
  status,
  startDateTime,
  endDateTime,
  external_client,
  userId
) => {
  const now = new Date();
  let client;

  try {
    if (!external_client) {
      client = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });

      if (!client) {
        throw Error("validator_appointment_userId_invalid");
      }
    }
    return await prisma.appointment.create({
      data: {
        title: title,
        status: status,
        startDateTime: startDateTime,
        endDateTime: endDateTime || addMinutes(now, 45),
        external_client: external_client,
        userId: client ? client.id : null,
      },
      include: {
        user: {
          select: { first_name: true, last_name: true, email: true },
        },
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const adminDeleteAppointment = async (id) => {
  try {
    return await prisma.appointment.delete({
      where: {
        id: id,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const adminUpdateAppointment = async (
  id,
  title,
  startDateTime,
  endDateTime,
  userId,
  status,
  external_client
) => {
  try {
    let updateData = {};
    if (title !== undefined) {
      updateData.title = title;
    }
    if (startDateTime !== undefined) {
      updateData.startDateTime = startDateTime;
    }
    if (endDateTime !== undefined) {
      updateData.endDateTime = endDateTime;
    }
    if (userId !== undefined) {
      updateData.userId = userId;
      updateData.external_client = null;
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (external_client !== undefined) {
      updateData.external_client = external_client;
      updateData.userId = null;
    }
    return await prisma.appointment.update({
      where: {
        id: id,
      },
      data: updateData,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = {
  updateUserOnlineStatus,
  findUserProfile,
  findUser,
  findUserById,
  createUser,
  updateUserProfile,
  deleteUser,
  changeUserPassword,
  getUserAppointments,
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
  adminNewAppointment,
  adminUpdateAppointment,
  adminDeleteAppointment,
};
