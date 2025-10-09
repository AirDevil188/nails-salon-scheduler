const { Router } = require("express");
const {
  checkInvitationStatus,
  authenticate,
} = require("@middlewares/authenticate");
const { languagePrefer } = require("@middlewares/language");

const { managePushToken } = require("@middlewares/pushToken");

const userController = require("@controllers/userController");

const userRouter = Router();

userRouter.post("/sign-in", languagePrefer, userController.signInUser);

userRouter.post(
  "/sign-up",
  languagePrefer,
  checkInvitationStatus,
  userController.signUpUser
);

userRouter.get(
  "/profile",
  authenticate,
  languagePrefer,
  managePushToken,
  userController.getUserProfile
);

userRouter.delete(
  "/profile",
  authenticate,
  languagePrefer,
  managePushToken,
  userController.deleteProfile
);

// user route to update avatar

userRouter.patch(
  "/profile",
  authenticate,
  languagePrefer,
  managePushToken,
  userController.updateProfile
);

userRouter.patch(
  "/profile/change-password",
  authenticate,
  languagePrefer,
  managePushToken,
  userController.changeUserPassword
);

userRouter.get(
  "/profile/upload/signature",
  authenticate,
  languagePrefer,
  managePushToken,
  userController.getUploadSignature
);

userRouter.post(
  "/profile/avatar",
  authenticate,
  languagePrefer,
  managePushToken,
  userController.saveAvatar
);

// :TODO:
// user route for forgotten password
module.exports = userRouter;
