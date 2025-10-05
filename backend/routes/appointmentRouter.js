const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");

const appointmentRouter = Router();

const appointmentController = require("@controllers/appointmentController");

appointmentRouter.get("/", appointmentController.getMyAppointments);

appointmentRouter.get(
  "/calendar",
  authenticate,
  appointmentController.getMonthlyAppointments
);

module.exports = appointmentRouter;
