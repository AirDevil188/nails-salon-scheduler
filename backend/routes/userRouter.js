const { Router } = require("express");
const {
  checkInvitationStatus,
  authenticate,
} = require("@middlewares/authenticate");

const userController = require("@controllers/userController");

const userRouter = Router();

userRouter.post("/sign-in", userController.signInUser);

userRouter.post("/sign-up", checkInvitationStatus, userController.signUpUser);

userRouter.get("/profile", authenticate, userController.getUserProfile);
userRouter.delete("/profile", authenticate, userController.deleteProfile);
// :TODO:
// user route to update avatar
// user route to change password
// user route for forgotten password

module.exports = userRouter;
