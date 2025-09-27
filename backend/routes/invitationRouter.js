const { Router } = require("express");

const invitationController = require("@controllers/invitationController");

const invitationRouter = Router();

invitationRouter.post("/generate", invitationController.generateInvitation);

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
