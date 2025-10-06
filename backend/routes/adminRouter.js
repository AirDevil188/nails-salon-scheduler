const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");
const { authorization } = require("@middlewares/authorization");

const adminRouter = Router();

const adminController = require("@controllers/adminController");

adminRouter.get(
  "/users",
  authenticate,
  authorization,
  adminController.getUsers
);

adminRouter.get(
  "/invitations",
  authenticate,
  authorization,
  adminController.getInvitations
);

adminRouter.delete(
  "/invitations/:invitationId",
  authenticate,
  authorization,
  adminController.deleteInvitation
);

adminRouter.delete(
  "/users/:userId",
  authenticate,
  authorization,
  adminController.deleteUser
);

adminRouter.get(
  "/appointments/calendar",
  authenticate,
  authorization,
  adminController.getMonthlyAppointments
);

adminRouter.get(
  "/appointments",
  authenticate,
  authorization,
  adminController.getAppointments
);

adminRouter.post(
  "/appointments/new",
  authenticate,
  authorization,
  adminController.newAppointment
);

adminRouter.delete(
  "/appointments/:appointmentId",
  authenticate,
  authorization,
  adminController.deleteAppointment
);

adminRouter.patch(
  "/appointments/:appointmentId",
  authenticate,
  authorization,
  adminController.updateAppointment
);

// :TODO:
// admin DELETE to delete appointments
// admin PUT route to grant an admin to someone else
// admin GET route for notes
// admin POST route for notes
// admin PUT route for notes

module.exports = adminRouter;
