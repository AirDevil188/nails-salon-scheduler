const { PrismaClient } = require("@prisma/client");
const { addMinutes } = require("date-fns/addMinutes");
const { formatInTimeZone } = require("date-fns-tz"); // Note: different import!

const { verifyHash, createHashedPassword } = require("../utils/utils");
const { addMonths } = require("date-fns/addMonths");
const { startOfWeek } = require("date-fns/startOfWeek");
const { endOfMonth } = require("date-fns/endOfMonth");
const { endOfWeek } = require("date-fns/endOfWeek");
const { startOfMonth } = require("date-fns/startOfMonth");
const { startOfDay } = require("date-fns/startOfDay");
const { addDays } = require("date-fns/addDays");

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
        id: true,
        email: true,
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

const userSaveAvatar = async (userId, publicId) => {
  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar: publicId,
      },
      select: {
        id: true,
        avatar: true,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getOldPublicAvatarId = async (userId) => {
  try {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        avatar: true,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const deleteUser = async (userId) => {
  try {
    return await prisma.user.deleteMany({
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
  timeScope,
  search
) => {
  const now = new Date();
  const where = { userId: userId };

  // sanitize params to prevent sql injection
  const pageSize = parseInt(limit, 10) || 25;
  const pageNumber = parseInt(page, 10) || 1;
  const skipCount = (pageNumber - 1) * pageSize;

  try {
    const validScopes = ["past", "upcoming", "all"];

    // search quey logic
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { external_client: { contains: search, mode: "insensitive" } },
        { status: { contains: search, mode: "insensitive" } },
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

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

const getMonthlyAppointments = async (userId, month) => {
  if (!month) {
    console.error("No month provided");

    return [];
  }

  const getMonthBoundaries = (month) => {
    // get the start date of the month example: 1st october
    const monthStart = startOfMonth(new Date(month));

    // gets the date of the first week which is 29th of september
    const calendarViewStart = startOfWeek(monthStart, { weekStartsOn: 1 });

    const monthEnd = endOfMonth(monthStart);
    console.error("monthEnd", monthEnd);

    // gets the date of the last week which is 2th of october
    const calendarViewEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    // end bound date to include 1st october time 23:59 but exclude 2th 00:00
    const endBoundDate = startOfDay(addDays(calendarViewEnd, 1));
    return {
      startDate: calendarViewStart,
      endDate: endBoundDate,
    };
  };
  try {
    const { startDate, endDate } = getMonthBoundaries(month);
    return await prisma.appointment.findMany({
      where: {
        userId: userId,
        startDateTime: { gte: startDate },
        endDateTime: { lt: endDate },
      },
      orderBy: {
        startDateTime: "asc",
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getAppointmentDetails = async (userId, id) => {
  try {
    return await prisma.appointment.findUnique({
      where: {
        id: id,
        userId: userId,
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
const invalidateRefreshToken = async (id) => {
  try {
    return prisma.token.deleteMany({
      where: {
        id: id,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const findRefreshTokenByTokenValue = async (token) => {
  try {
    return await prisma.token.findUnique({
      where: {
        token: token,
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const updateRefreshToken = async (id, token, expiresAt) => {
  try {
    return await prisma.token.update({
      where: {
        id: id,
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
    return await prisma.invitation.deleteMany({
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
const adminGetAllUsers = async (userId, { limit, page, orderBy, search }) => {
  try {
    const pageSize = parseInt(limit, 10) || 25;
    const pageNumber = parseInt(page, 10) || 1;
    const skipCount = (pageNumber - 1) * pageSize;
    const where = {};

    // search quey logic
    if (search) {
      where.OR = [
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          first_name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          last_name: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

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
          ...where,
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
    return await prisma.user.deleteMany({
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
  search,
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

  if (search) {
    where.OR = [
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        token: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        code: {
          contains: search,
          mode: "insensitive",
        },
      },
      { user: { first_name: { contains: search, mode: "insensitive" } } },
      { user: { last_name: { contains: search, mode: "insensitive" } } },
    ];
  }
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
    return await prisma.invitation.deleteMany({
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
  search,
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

    // search quey logic
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { external_client: { contains: search, mode: "insensitive" } },
        { status: { contains: search, mode: "insensitive" } },
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

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

const adminGetMonthlyAppointments = async (month) => {
  if (!month) {
    console.error("No month provided");

    return [];
  }

  const getMonthBoundaries = (month) => {
    // get the start date of the month example: 1st october
    const monthStart = startOfMonth(new Date(month));

    // gets the date of the first week which is 29th of september
    const calendarViewStart = startOfWeek(monthStart, { weekStartsOn: 1 });

    const monthEnd = endOfMonth(monthStart);
    console.error("monthEnd", monthEnd);

    // gets the date of the last week which is 2th of october
    const calendarViewEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    // end bound date to include 1st october time 23:59 but exclude 2th 00:00
    const endBoundDate = startOfDay(addDays(calendarViewEnd, 1));
    console.error(calendarViewStart, endBoundDate);
    return {
      startDate: calendarViewStart,
      endDate: endBoundDate,
    };
  };
  try {
    const { startDate, endDate } = getMonthBoundaries(month);
    return await prisma.appointment.findMany({
      where: {
        startDateTime: { gte: startDate },
        endDateTime: { lt: endDate },
      },
      orderBy: {
        startDateTime: "asc",
      },
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const adminGetAppointmentDetails = async (id) => {
  try {
    return await prisma.appointment.findUnique({
      where: {
        id: id,
      },
    });
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
    const appointmentData = await prisma.appointment.findUnique({
      where: {
        id: id,
      },
      select: {
        userId: true,
      },
    });
    if (!appointmentData) {
      return { userId: null, count: 0 };
    }
    const appointment = await prisma.appointment.deleteMany({
      where: {
        id: id,
      },
    });
    return {
      count: appointment.count,
      userId: appointmentData.userId,
    };
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

const adminCancelAppointment = async (id) => {
  const appointmentData = await prisma.appointment.findUnique({
    where: {
      id: id,
    },
    select: {
      userId: true,
    },
  });

  // appointment not found in db
  if (!appointmentData) {
    return { count: 0, userId: null };
  }
  try {
    const appointment = await prisma.appointment.updateMany({
      where: {
        id: id,
        status: "scheduled",
      },
      data: {
        status: "canceled",
      },
    });
    return {
      count: appointment.count,
      userId: appointmentData.userId,
    };
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
  getOldPublicAvatarId,
  createUser,
  updateUserProfile,
  deleteUser,
  changeUserPassword,
  userSaveAvatar,
  getUserAppointments,
  getMonthlyAppointments,
  getAppointmentDetails,
  findRefreshTokenByTokenValue,
  createRefreshToken,
  updateRefreshToken,
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
  adminGetMonthlyAppointments,
  adminGetAppointmentDetails,
  adminGetAllInvitations,
  adminDeleteInvitation,
  adminNewAppointment,
  adminUpdateAppointment,
  adminDeleteAppointment,
  adminCancelAppointment,
};
