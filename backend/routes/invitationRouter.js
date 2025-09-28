const { Router } = require("express");

const { authenticate } = require("@middlewares/authenticate");
const { authorization } = require("@middlewares/authorization");

const invitationController = require("@controllers/invitationController");

const invitationRouter = Router();

invitationRouter.post(
  "/generate",
  authenticate,
  authorization,
  invitationController.generateInvitation
);

invitationRouter.post(
  "/validate-token",
  invitationController.validateInvitation
);

invitationRouter.post(
  "/validate-verification-code",
  invitationController.verifyInvitationCode
);

invitationRouter.post(
  "/resend-verification-code",
  invitationController.resendVerificationCode
);

module.exports = invitationRouter;
