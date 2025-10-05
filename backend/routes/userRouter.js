const { Router } = require("express");
const {
  checkInvitationStatus,
  authenticate,
} = require("@middlewares/authenticate");

const userController = require("@controllers/userController");

const userRouter = Router();

userRouter.post("/sign-in", userController.signInUser);

userRouter.post("/sign-up", checkInvitationStatus, userController.signUpUser);

// :TODO:
// get route for getting user profile
userRouter.get("/profile", authenticate, userController.getUserProfile);
// user route to delete account
// user route to update avatar
// user route to change password
// user route for forgotten password

module.exports = userRouter;
