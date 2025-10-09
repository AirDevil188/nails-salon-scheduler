const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");

const appointmentRouter = Router();

const { languagePrefer } = require("@middlewares/language");
const { managePushToken } = require("@middlewares/pushToken");
const appointmentController = require("@controllers/appointmentController");

appointmentRouter.get(
  "/",
  authenticate,
  languagePrefer,
  managePushToken,
  appointmentController.getMyAppointments
);

appointmentRouter.get(
  "/calendar",
  authenticate,
  languagePrefer,
  managePushToken,
  appointmentController.getMonthlyAppointments
);

appointmentRouter.get(
  "/:appointmentId",
  authenticate,
  languagePrefer,
  managePushToken,
  appointmentController.getAppointmentDetails
);

module.exports = appointmentRouter;
