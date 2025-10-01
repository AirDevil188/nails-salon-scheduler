const db = require("@db/query");
const { isUUID } = require("@utils/utils");
const { body, validationResult } = require("express-validator");

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
  try {
    const { invitationId } = req.params;
    await db.adminDeleteInvitation(invitationId);
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
  try {
    const { userId } = req.params;
    // delete the user
    await db.adminDeleteUser(userId);
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
// TODO:
// admins can create new appointments
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
    .notEmpty()
    .withMessage("validator_appointment_userId_required")
    .custom((value) => {
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

  async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      // map all messages
      const validationErrors = errs.array().map((error) => error.msg);

      // create costume err obj
      const error = new Error("Validation Failed");
      error.name = "ValidationError";
      error.status = 400; // Use 400 Bad Request for validation errors
      error.validationMessages = validationErrors; // Attach the array of message keys
      return next(error);
    }
    try {
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
    const { id } = req.params;
    await db.adminDeleteInvitation(id);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

// TODO:
// admins can update their appointments
// admins can cancel appointments
module.exports = {
  getInvitations,
  deleteInvitation,
  getUsers,
  deleteUser,
  getAppointments,
  newAppointment,
  deleteAppointment,
};
