const { Router } = require("express");

const { authenticate } = require("@middlewares/authenticate");
const { authorization } = require("@middlewares/authorization");
const { languagePrefer } = require("@middlewares/language");
const invitationController = require("@controllers/invitationController");

const invitationRouter = Router();

invitationRouter.post(
  "/generate",
  authenticate,
  authorization,
  languagePrefer,
  invitationController.generateInvitation
);

invitationRouter.post(
  "/validate-token",
  languagePrefer,
  invitationController.validateInvitation
);

invitationRouter.post(
  "/validate-verification-code",
  languagePrefer,
  invitationController.verifyInvitationCode
);

invitationRouter.post(
  "/resend-verification-code",
  languagePrefer,
  invitationController.resendVerificationCode
);

module.exports = invitationRouter;
