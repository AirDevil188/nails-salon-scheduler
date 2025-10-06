const db = require("@db/query");
const { isUUID } = require("@utils/utils");
const { body, validationResult } = require("express-validator");
const { getIo } = require("../socket/services/socketManager");

const getInvitations = async (req, res, next) => {
  try {
    const {
      status,
      limit: limitString = "25",
      page: pageString = "1",
      orderBy,
    } = req.query;

    const safeLimit = parseInt(limitString, 10) || 25;
    const safePage = parseInt(pageString, 10) || 1;

    // find all invitations in the db
    const { invitations, totalCount } = await db.adminGetAllInvitations({
      status,
      limit: safeLimit,
      page: safePage,
      orderBy,
    });

    return res.status(200).json({
      invitations: invitations,
      limit: safeLimit,
      page: safePage,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const deleteInvitation = async (req, res, next) => {
  const io = getIo();
  try {
    const { invitationId } = req.params;
    await db.adminDeleteInvitation(invitationId);
    io.to("admin-dashboard").emit("admin:invitationDelete", invitationId);
    console.log(
      `Sent user deletion alert for invitation: ${invitationId} to the 'admin-dashboard' room.`
    );
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const {
      limit: limitString = "25",
      page: pageString = "1",
      orderBy,
    } = req.query;
    const { id } = req.user;

    const safeLimit = parseInt(limitString, 10) || 25;
    const safePage = parseInt(pageString, 10) || 1;

    // find all users in the db
    const { users, totalCount } = await db.adminGetAllUsers(id, {
      limit: safeLimit,
      page: safePage,
      orderBy,
    });

    return res.status(200).json({
      users: users,
      limit: safeLimit,
      page: safePage,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
    });
  } catch (err) {
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  const io = getIo();
  try {
    const { userId } = req.params;
    // delete the user
    await db.adminDeleteUser(userId);
    io.to("admin-dashboard").emit("admin:userDeleted", userId);
    console.log(
      `Sent user deletion alert for userId: ${userId} to the 'admin-dashboard' room.`
    );
    if (userId) {
      io.to(`user:${userId}`).emit("user:deleted", userId);
      console.log(
        `Sent user deletion confirmation to the 'user:${userId}' room.`
      );
    }
    // return 204 because we don't have any content to return
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

const getAppointments = async (req, res, next) => {
  // set default if not provided to req query
  try {
    const { status, limit = "25", page = "1", orderBy, timeScope } = req.query;

    const safeLimit = parseInt(limit, 10) || 25;
    const safePage = parseInt(page, 10) || 1;

    const { appointments, totalCount } = await db.adminGetAllAppointments({
      status,
      limit: safeLimit,
      page: safePage,
      orderBy,
      timeScope,
    });

    return res.status(200).json({
      appointments: appointments,
      limit: safeLimit,
      page: safePage,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
    });
  } catch (err) {
    return next(err);
  }
};

const getMonthlyAppointments = async (req, res, next) => {
  const { month } = req.query;

  try {
    const appointments = await db.adminGetMonthlyAppointments(month);
    res.status(200).json({
      appointments: appointments,
    });
  } catch (err) {
    return next(err);
  }
};

const getAppointmentDetails = async (req, res, next) => {
  const { appointmentId } = req.params;
  try {
    const appointment = await db.adminGetAppointmentDetails(appointmentId);
    return res.status(200).json({
      appointment: appointment,
    });
  } catch (err) {
    return next(err);
  }
};

const newAppointment = [
  // insure that title is not empty
  body("title").trim().notEmpty().withMessage("validator_appointment_title"),
  // insure that
  body("startDateTime")
    .isISO8601()
    .withMessage("validator_appointment_startDateTime_not_empty")
    .custom((value, { req }) => {
      // get server time
      const now = new Date();
      const startTime = new Date(value);

      // check if the startDateTime is less or equal to now
      if (startTime <= now) {
        throw new Error("validator_appointment_startDateTime_not_in_future");
      }
      return true;
    }),
  body("endDateTime")
    .isISO8601()
    .custom((value, { req }) => {
      const now = new Date();
      const endTime = new Date(value);

      if (endTime < now) {
        throw new Error("validator_appointment_endDateTime_not_in_past");
      }
      return true;
    })
    // insure that startTime can't be larger or equal to  endTime
    .custom((value, { req }) => {
      const startDateTimeString = req.body.startDateTime;
      const startTime = new Date(startDateTimeString);
      const endTime = new Date(value);

      if (startTime >= endTime) {
        throw new Error("validator_appointment_duration_invalid");
      }
      return true;
    }),
  // insure that the userId is not empty and that is UUID
  body("userId")
    .custom((value, { req }) => {
      if (!req.body.external_client && !value) {
        throw new Error("validator_appointment_userId_required");
      }
      return true;
    })
    .custom((value, { req }) => {
      // if external_client is provided then userId can be null
      if (req.body.external_client && !value) {
        return true;
      }
      if (!isUUID(value)) {
        throw new Error("validator_appointment_userId_invalid");
      }
      return true;
    }),
  // insure that the appointment status is not empty and that matches the provided options
  body("status")
    .notEmpty()
    .withMessage("validator_appointment_status_not_empty")
    .isIn(["scheduled", "completed", "canceled", "no_show"])
    .withMessage("validator_appointment_status_invalid"),

  body("external_client").custom((value, { req }) => {
    if (value && req.body.userId) {
      throw new Error("validator_external_client_userId_not_allowed");
    }
    return true;
  }),

  async (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      // map all messages
      const validationErrors = errs.array().map((error) => error.msg);
      // create costume err obj
      const error = new Error("Validation Error");
      error.status = 400;
      error.name = "ValidationError";
      error.validationMessages = validationErrors; // Attach the array of message keys
      return next(error);
    }
    try {
      const io = getIo();
      const {
        title,
        startDateTime,
        endDateTime,
        status,
        external_client,
        userId,
      } = req.body;

      const appointment = await db.adminNewAppointment(
        title,
        status,
        startDateTime,
        endDateTime,
        external_client,
        userId
      );
      io.to("admin-dashboard").emit("admin:appointment:created", appointment);
      console.log(`Sent new appointment alert to the 'admin-dashboard' room.`);
      if (userId) {
        io.to(`user:${userId}`).emit("appointment:created", appointment);
        console.log(`Sent new appointment alert to the 'user:${userId}' room.`);
      }
      return res.status(201).json({
        appointment: appointment,
      });
    } catch (err) {
      return next(err);
    }
  },
];

const deleteAppointment = async (req, res, next) => {
  try {
    const io = getIo();
    const { appointmentId } = req.params;
    const appointment = await db.adminDeleteAppointment(appointmentId);
    const userId = appointment?.userId;

    io.to("admin-dashboard").emit("admin:appointment:deleted", appointmentId);
    console.log(`Sent new appointment alert to the 'admin-dashboard' room.`);
    if (userId) {
      io.to(`user:${userId}`).emit("user:appointment:deleted", appointmentId);
      console.log(`Sent new appointment alert to the 'user:${userId}' room.`);
    }
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

const updateAppointment = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("validator_appointment_title")
    .optional(),
  body("startDateTime")
    .notEmpty()
    .isISO8601()
    .withMessage("validator_appointment_startDateTime_not_empty")
    .custom((value, { req }) => {
      // get server time
      const now = new Date();
      const startTime = new Date(value);

      // check if the startDateTime is less or equal to now
      if (startTime <= now) {
        throw new Error("validator_appointment_startDateTime_not_in_future");
      }
      return true;
    })
    .optional(),
  body("endDateTime")
    .notEmpty()
    .isISO8601()
    .custom((value, { req }) => {
      const now = new Date();
      const endTime = new Date(value);

      // run this check only if both dates are present
      if (value && req.body.startDateTime) {
        if (endTime < now) {
          throw new Error("validator_appointment_endDateTime_not_in_past");
        }
        return true;
      }
    })

    .optional(),
  body("userId")
    .custom((value, { req }) => {
      if (!req.body.external_client && !value) {
        throw new Error("validator_appointment_userId_required");
      }
      return true;
    })
    .custom((value) => {
      if (req.body.external_client && !value) {
        return true;
      }
      if (!isUUID(value)) {
        throw new Error("validator_appointment_userId_invalid");
      }
      return true;
    })
    .optional(),
  // insure that the appointment status is not empty and that matches the provided options
  body("status")
    .notEmpty()
    .withMessage("validator_appointment_status_not_empty")
    .isIn(["scheduled", "completed", "canceled", "no_show"])
    .withMessage("validator_appointment_status_invalid")
    .optional(),

  body("external_client")
    .custom((value, { req }) => {
      if (value && req.body.userId) {
        throw new Error("validator_external_client_userId_not_allowed");
      }
      return true;
    })
    .optional(),

  async (req, res, next) => {
    const errs = validationResult(req);

    // check if the validation errors are present
    if (!errs.isEmpty()) {
      const validationErrors = errs.array().map((error) => error.msg);
      const error = new Error("Validation Error");
      error.name = "ValidationError";
      error.status = 400;
      error.validationMessages = validationErrors;
      return next(error);
    }

    try {
      const { appointmentId } = req.params;
      const io = getIo();

      const {
        title,
        startDateTime,
        endDateTime,
        status,
        userId,
        external_client,
      } = req.body;

      const appointment = await db.adminUpdateAppointment(
        appointmentId,
        title,
        startDateTime,
        endDateTime,
        userId,
        status,
        external_client
      );
      io.to("admin-dashboard").emit("admin:appointment:updated", appointment);
      console.log(
        `Sent updated appointment alert to the 'admin-dashboard' room.`
      );
      if (appointment?.userId) {
        io.to(`user:${appointment.userId}`).emit(
          "user:appointment:updated",
          appointment
        );
        console.log(
          `Sent updated appointment alert to the 'user:${userId}' room.`
        );
      }
      return res.status(200).json({
        appointment: appointment,
      });
    } catch (err) {
      return next(err);
    }
  },
];

// TODO:
// admins can cancel appointments
const cancelAppointment = async (req, res, next) => {
  try {
    const io = getIo();
    const { appointmentId } = req.params;

    const appointment = await db.adminCancelAppointment(appointmentId);
    if (appointment.count === 1) {
      io.to("admin-dashboard").emit("admin:appointmentCanceled", appointmentId);
      if (appointment?.userId) {
        io.to(`user:${appointment.userId}`).emit(
          "user:appointmentCanceled",
          appointmentId
        );
      }
      return res.status(200).json({
        appointment: appointment,
      });
    }
  } catch (err) {
    return next(err);
  }
};
module.exports = {
  getInvitations,
  deleteInvitation,
  getUsers,
  deleteUser,
  getAppointments,
  getMonthlyAppointments,
  getAppointmentDetails,
  newAppointment,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
};
