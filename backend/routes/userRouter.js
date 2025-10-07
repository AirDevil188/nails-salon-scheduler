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

// user route to update avatar

userRouter.patch("/profile", authenticate, userController.updateProfile);

userRouter.patch(
  "/profile/change-password",
  authenticate,
  userController.changeUserPassword
);

userRouter.get(
  "/profile/upload/signature",
  authenticate,
  userController.getUploadSignature
);

userRouter.post("/profile/avatar", authenticate, userController.saveAvatar);

// :TODO:
// user route for forgotten password
module.exports = userRouter;
