const { Router } = require("express");

const invitationController = require("@controllers/invitationController");

const invitationRouter = Router();

invitationRouter.post("/generate", invitationController.generateInvitation);

// invitationRouter.get(
//   "/validate-token",
//   invitationController.validateInvitation
// );

module.exports = invitationRouter;
