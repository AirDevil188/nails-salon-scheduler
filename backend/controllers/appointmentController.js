const { body, validationResult } = require("express-validator");
const db = require("@db/query");
const { isUUID } = require("@utils/utils");
const { getIo } = require("@socketServices/socketManager");

const getMyAppointments = async (req, res, next) => {
  const { id } = req.user;
  // set default if not provided to req query
  try {
    const { status, limit = "25", page = "1", orderBy, timeScope } = req.query;

    const safeLimit = parseInt(limit, 10) || 25;
    const safePage = parseInt(page, 10) || 1;

    const { appointments, totalCount } = await db.getUserAppointments({
      id,
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
  const now = new Date();
  try {
    const { id } = req.user;
    const appointments = await db.getMonthlyAppointments(id, now);
    res.status(200).json({
      appointments: appointments,
    });
  } catch (err) {
    return next(err);
  }
};

const getAppointmentDetails = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { appointmentId } = req.params;
    const appointment = await db.getAppointmentDetails(id, appointmentId);
    return res.status(200).json({
      appointment: appointment,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMyAppointments,
  getMonthlyAppointments,
  getAppointmentDetails,
};
