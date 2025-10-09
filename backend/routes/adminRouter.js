const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");
const { authorization } = require("@middlewares/authorization");

const adminRouter = Router();

const adminController = require("@controllers/adminController");
const noteController = require("@controllers/noteController");
const { languagePrefer } = require("@middlewares/language");
const { managePushToken } = require("@middlewares/pushToken");

adminRouter.get(
  "/users",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.getUsers
);

adminRouter.get(
  "/invitations",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.getInvitations
);

adminRouter.delete(
  "/invitations/:invitationId",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.deleteInvitation
);

adminRouter.delete(
  "/users/:userId",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.deleteUser
);

adminRouter.get(
  "/appointments/calendar",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.getMonthlyAppointments
);

adminRouter.get(
  "/appointments",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.getAppointments
);

adminRouter.post(
  "/appointments/new",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.newAppointment
);

adminRouter.get(
  "/appointments/:appointmentId",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.getAppointmentDetails
);

adminRouter.delete(
  "/appointments/:appointmentId",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.deleteAppointment
);

adminRouter.patch(
  "/appointments/:appointmentId",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.updateAppointment
);

adminRouter.post(
  "/appointments/:appointmentId/cancel",
  authenticate,
  authorization,
  // languagePrefer,
  // managePushToken,
  adminController.cancelAppointment
);

adminRouter.get(
  "/notes",
  authenticate,
  authorization,
  languagePrefer,
  managePushToken,
  noteController.getNotes
);

adminRouter.post(
  "/notes/new",
  authenticate,
  authorization,
  languagePrefer,
  managePushToken,
  noteController.createNote
);

adminRouter.delete(
  "/notes/:noteId",
  authenticate,
  authorization,
  languagePrefer,
  managePushToken,
  noteController.deleteNote
);

adminRouter.get(
  "/notes/:noteId",
  authenticate,
  authorization,
  languagePrefer,
  managePushToken,
  noteController.getNoteDetails
);

adminRouter.patch(
  "/notes/:noteId",
  authenticate,
  authorization,
  languagePrefer,
  managePushToken,
  noteController.updateNote
);

// :TODO:
// admin PUT route to grant an admin to someone else

// admin GET route for notes
// admin POST route for notes
// admin PUT route for notes

module.exports = adminRouter;
