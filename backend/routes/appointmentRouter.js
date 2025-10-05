const { Router } = require("express");

const appointmentRouter = Router();

const appointmentController = require("@controllers/appointmentController");

appointmentRouter.get("/", appointmentController.getMyAppointments);

module.exports = appointmentRouter;
