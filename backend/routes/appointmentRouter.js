const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");

const appointmentRouter = Router();

const { languagePrefer } = require("@middlewares/language");
const appointmentController = require("@controllers/appointmentController");

appointmentRouter.get(
  "/",
  authenticate,
  appointmentController.getMyAppointments
);

appointmentRouter.get(
  "/calendar",
  authenticate,
  appointmentController.getMonthlyAppointments
);

appointmentRouter.get(
  "/:appointmentId",
  authenticate,
  appointmentController.getAppointmentDetails
);

module.exports = appointmentRouter;
