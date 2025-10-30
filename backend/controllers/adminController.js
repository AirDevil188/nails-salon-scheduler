const db = require("@db/query");
const { isUUID } = require("@utils/utils");
const { body, validationResult } = require("express-validator");
const { getIo } = require("../socket/services/socketManager");
const { getLocalizedNotificationText } = require("@utils/language");
const prisma = require("@prisma/client"); // Your ORM client
const {
  sendNotificationBatch,
  expo,
} = require("@services/expoNotificationService");

const getInvitations = async (req, res, next) => {
  try {
    const {
      status,
      limit: limitString = "25",
      page: pageString = "1",
      orderBy,
      search,
    } = req.query;

    const safeLimit = parseInt(limitString, 10) || 25;
    const safePage = parseInt(pageString, 10) || 1;

    // find all invitations in the db
    const { invitations, totalCount } = await db.adminGetAllInvitations({
      status,
      limit: safeLimit,
      page: safePage,
      orderBy,
      search,
    });

    return res.status(200).json({
      invitations: invitations,
      limit: safeLimit,
      page: safePage,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
    });
  } catch (err) {
    return next(err);
  }
};

const deleteInvitation = async (req, res, next) => {
  const io = getIo();
  try {
    const { invitationId } = req.params;
    const deleteResult = await db.adminDeleteInvitation(invitationId);
    if (deleteResult.count > 0) {
      io.to("admin-dashboard").emit("admin:invitationDelete", invitationId);
      console.log(
        `Sent user deletion alert for invitation: ${invitationId} to the 'admin-dashboard' room.`
      );
    }
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const {
      limit: limitString = "25",
      page: pageString = "1",
      orderBy,
      search,
    } = req.query;
    const { id } = req.user;

    const safeLimit = parseInt(limitString, 10) || 25;
    const safePage = parseInt(pageString, 10) || 1;

    // find all users in the db
    const { users, totalCount } = await db.adminGetAllUsers(id, {
      limit: safeLimit,
      page: safePage,
      orderBy,
      search,
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
    const deleteResult = await db.softAdminDeleteUser(userId);
    if (deleteResult.count > 0) {
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
    const {
      status,
      limit = "25",
      page = "1",
      orderBy,
      timeScope,
      search,
    } = req.query;

    const safeLimit = parseInt(limit, 10) || 25;
    const safePage = parseInt(page, 10) || 1;

    const { appointments, totalCount } = await db.adminGetAllAppointments({
      status,
      limit: safeLimit,
      page: safePage,
      orderBy,
      timeScope,
      search,
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
  const { date, view } = req.query;

  try {
    const appointments = await db.adminGetMonthlyAppointments(date, view);
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
      const startTime = new Date(value);
      const now = new Date();

      // if the start time is at least 1 minute in the future
      // to avoid race conditions and ensure the booking is truly forward-looking.
      const oneMinuteFromNow = new Date(now.getTime() + 60000);

      // Check if the startDateTime is less than one minute from now.
      if (startTime < oneMinuteFromNow) {
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
        console.log(value, "witcher");
        throw new Error("validator_appointment_userId_invalid");
      }
      return true;
    }),
  // insure that the appointment status is not empty and that matches the provided options
  // body("status")
  //   .notEmpty()
  //   .withMessage("validator_appointment_status_not_empty")
  //   .isIn(["scheduled", "completed", "canceled", "no_show"])
  //   .withMessage("validator_appointment_status_invalid"),

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
      console.log(validationErrors);
      // create costume err obj
      const error = new Error("Validation Error");
      console.log(error);
      error.status = 400;
      error.name = "ValidationError";
      error.validationMessages = validationErrors; // Attach the array of message keys
      return next(error);
    }
    try {
      const { startDateTime, endDateTime } = req.body;
      const appointmentStart = new Date(startDateTime);
      const now = new Date();
      now.setMilliseconds(0);

      if (appointmentStart <= now) {
        const validationErrors = errs.array().map((error) => error.msg);
        const error = new Error(
          "validator_appointment_startDateTime_not_in_future"
        );
        error.status = 400;
        error.name = "ValidationError";
        error.validationMessages = validationErrors;
        return next(error);
      }
      const io = getIo();
      const { title, description, external_client, userId } = req.body;

      const appointment = await db.adminNewAppointment(
        title,
        description,
        startDateTime,
        endDateTime,
        external_client,
        userId
      );

      io.to("admin-dashboard").emit("admin:appointment:created", appointment);
      console.log(`Sent new appointment alert to the 'admin-dashboard' room.`);
      if (userId) {
        // get push tokens from the user
        const recipientTokens = await db.getPushTokensUser(userId);
        // check if there are tokens for that user
        if (recipientTokens && recipientTokens.length > 0) {
          // get the message base on preferred language
          const { title, body, message } = getLocalizedNotificationText(
            recipientTokens.user?.preferredLanguage,
            "appointment_new"
          );

          const finalBody = `${body} ${new Date(newAppointment.startDateTime).toLocaleString(recipientTokens.user?.preferredLanguage, { dateStyle: "short", timeStyle: "short" })}`;

          const finalMessage = `${message}${newAppointment.id}`;

          // build the object
          const notificationsToSend = recipientTokens.map((tokenRecord) => ({
            pushToken: tokenRecord.token,
            userId: newAppointment.userId,
            title: title,
            message: finalMessage,
            body: finalBody,
          }));

          await sendNotificationBatch(notificationsToSend, expo, prisma);
        }

        io.to(`user:${userId}`).emit("admin:appointment:created", appointment);
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
    const existingAppointment = db.adminGetAppointmentDetails(appointmentId);
    if (!existingAppointment) {
      if (!existingAppointment) {
        const error = new Error("appointment_not_found");
        error.name = "appointment_not_found";
        error.status = 404;
        return next(error);
      }
    }
    const now = new Date();
    const existingStart = existingAppointment.startDateTime;

    if (existingStart < now) {
      const error = new Error("appointment_delete_in_past");
      error.name = "appointment_delete_in_past";
      error.status = 400;
      return next(error);
    }

    const deleteResult = await db.adminDeleteAppointment(appointmentId);
    const userId = deleteResult?.userId;

    if (deleteResult.count > 0) {
      io.to("admin-dashboard").emit("admin:appointment:deleted", appointmentId);
      if (userId) {
        io.to(`user:${userId}`).emit("user:appointment:deleted", appointmentId);
      }
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
    .isISO8601()
    .withMessage("validator_appointment_startDateTime_not_empty")
    .custom((value) => {
      // NOTE: We only check format and basic validity here.
      // The "must be in future" check is moved to the async middleware
      // to allow dynamic checking against the *existing* appointment time.
      return true;
    })
    .optional(),
  body("endDateTime")
    .isISO8601()
    .withMessage("validator_appointment_endDateTime_not_empty")
    .custom((value, { req }) => {
      const startTime = new Date(req.body.startDateTime);
      const endTime = new Date(value);

      // Check 1: endDateTime must be after startDateTime
      if (startTime && endTime && endTime <= startTime) {
        throw new Error("validator_appointment_endDateTime_before_start");
      }
      return true;
    })
    .optional(),

  body("userId")
    .custom((value, { req }) => {
      if (!req.body.external_client && !value) {
        throw new Error("validator_appointment_userId_required");
      }

      if (req.body.external_client && value) {
        throw new Error("validator_external_client_userId_not_allowed");
      }
      return true;
    })
    .custom((value) => {
      if (value && !isUUID(value)) {
        throw new Error("validator_appointment_userId_invalid");
      }
      return true;
    })
    .optional(),
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
        description,
        startDateTime,
        endDateTime,
        status,
        userId,
        external_client,
      } = req.body;

      const existingAppointment =
        await db.adminGetAppointmentDetails(appointmentId);

      if (!existingAppointment) {
        const error = new Error("appointment_not_found");
        error.name = "appointment_not_found";
        error.status = 404;
        return next(error);
      }

      console.log(existingAppointment);

      const now = new Date();
      const existingStart = new Date(existingAppointment.startDateTime);
      const isExistingInPast = existingStart < now;

      // if the appointment was in the past, any new date MUST be in the future.
      if (isExistingInPast) {
        // Check if the date is actually being changed
        if (
          startDateTime &&
          startDateTime !== existingAppointment.startDateTime
        ) {
          const newStart = new Date(startDateTime);

          if (newStart <= now) {
            const error = new Error(
              "appointment_new_startDateTime_must_be_in_the_future"
            );
            error.name = "BUSINESS_RULE_VIOLATION";
            error.status = 400;
            return next(error);
          }
        }
      }

      if (status && status !== existingAppointment.status) {
        // prevent no_show status if the appointment is strictly in the future.
        if (status === "no_show") {
          if (existingStart > now) {
            const error = new Error(
              "appointment_cannot_be_marked_no_show_in_the_future"
            );
            error.name = "BUSINESS_RULE_VIOLATION";
            error.status = 400;
            return next(error);
          }
        }

        const terminalStatuses = ["completed", "canceled", "no_show"];
        if (terminalStatuses.includes(existingAppointment.status)) {
          const error = new Error(
            `Cannot change status from finalized state: ${existingAppointment.status}.`
          );
          error.name = "BUSINESS_RULE_VIOLATION";
          error.status = 400;
          return next(error);
        }
      }

      const appointment = await db.adminUpdateAppointment(
        appointmentId,
        title,
        description,
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
        // ... (Push token and notification logic remains the same) ...
        const recipientTokens = await db.getPushTokensUser(userId);
        if (recipientTokens && recipientTokens.length > 0) {
          const {
            title: notifTitle,
            body,
            message,
          } = getLocalizedNotificationText(
            recipientTokens.user?.preferredLanguage,
            "appointment_update"
          );
          const finalBody = `${body} ${new Date(appointment.startDateTime).toLocaleString(recipientTokens.user?.preferredLanguage, { dateStyle: "short", timeStyle: "short" })}`;
          const finalMessage = `${message}${appointmentId}`;
          const notificationsToSend = recipientTokens.map((tokenRecord) => ({
            pushToken: tokenRecord.token,
            userId: appointment.userId,
            title: notifTitle,
            message: finalMessage,
            body: finalBody,
          }));
          await sendNotificationBatch(notificationsToSend, expo, prisma);
        }

        io.to(`user:${appointment.userId}`).emit(
          "user:appointment:updated",
          appointment
        );
        console.log(
          `Sent updated appointment alert to the 'user:${userId}' room.`
        );
      }

      return res.status(200).json({ appointment: appointment });
    } catch (err) {
      return next(err);
    }
  },
];

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
