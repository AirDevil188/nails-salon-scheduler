const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");
const { authorization } = require("@middlewares/authorization");

const adminRouter = Router();

const adminController = require("@controllers/adminController");
const noteController = require("@controllers/noteController");
const { languagePrefer } = require("@middlewares/language");

adminRouter.get(
  "/users",
  authenticate,
  authorization,
  languagePrefer,
  adminController.getUsers
);

adminRouter.get(
  "/invitations",
  authenticate,
  authorization,
  languagePrefer,
  adminController.getInvitations
);

adminRouter.delete(
  "/invitations/:invitationId",
  authenticate,
  authorization,
  languagePrefer,
  adminController.deleteInvitation
);

adminRouter.delete(
  "/users/:userId",
  authenticate,
  authorization,
  languagePrefer,
  adminController.deleteUser
);

adminRouter.get(
  "/appointments/calendar",
  authenticate,
  authorization,
  languagePrefer,
  adminController.getMonthlyAppointments
);

adminRouter.get(
  "/appointments",
  authenticate,
  authorization,
  languagePrefer,
  adminController.getAppointments
);

adminRouter.post(
  "/appointments/new",
  authenticate,
  authorization,
  languagePrefer,
  adminController.newAppointment
);

adminRouter.get(
  "/appointments/:appointmentId",
  authenticate,
  authorization,
  languagePrefer,
  adminController.getAppointmentDetails
);

adminRouter.delete(
  "/appointments/:appointmentId",
  authenticate,
  authorization,
  languagePrefer,
  adminController.deleteAppointment
);

adminRouter.patch(
  "/appointments/:appointmentId",
  authenticate,
  authorization,
  languagePrefer,
  adminController.updateAppointment
);

adminRouter.post(
  "/appointments/:appointmentId/cancel",
  authenticate,
  authorization,
  languagePrefer,
  adminController.cancelAppointment
);

adminRouter.get(
  "/notes",
  authenticate,
  authorization,
  languagePrefer,
  noteController.getNotes
);

adminRouter.post(
  "/notes/new",
  authenticate,
  authorization,
  languagePrefer,
  noteController.createNote
);

adminRouter.delete(
  "/notes/:noteId",
  authenticate,
  authorization,
  languagePrefer,
  noteController.deleteNote
);

adminRouter.get(
  "/notes/:noteId",
  authenticate,
  authorization,
  languagePrefer,
  noteController.getNoteDetails
);

adminRouter.patch(
  "/notes/:noteId",
  authenticate,
  authorization,
  languagePrefer,
  noteController.updateNote
);

// :TODO:
// admin PUT route to grant an admin to someone else

// admin GET route for notes
// admin POST route for notes
// admin PUT route for notes

module.exports = adminRouter;
