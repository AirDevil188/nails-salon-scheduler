const { Router } = require("express");
const { checkInvitationStatus } = require("@middlewares/authenticate");

const userController = require("@controllers/userController");

const userRouter = Router();

userRouter.post("/sign-in", userController.signInUser);

userRouter.post("/sign-up", checkInvitationStatus, userController.signUpUser);

module.exports = userRouter;
