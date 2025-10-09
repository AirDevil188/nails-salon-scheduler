const { Router } = require("express");
const {
  checkInvitationStatus,
  authenticate,
} = require("@middlewares/authenticate");
const { languagePrefer } = require("@middlewares/language");

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
  userController.getUserProfile
);

userRouter.delete(
  "/profile",
  authenticate,
  languagePrefer,
  userController.deleteProfile
);

// user route to update avatar

userRouter.patch(
  "/profile",
  authenticate,
  languagePrefer,
  userController.updateProfile
);

userRouter.patch(
  "/profile/change-password",
  authenticate,
  userController.changeUserPassword
);

userRouter.get(
  "/profile/upload/signature",
  authenticate,
  languagePrefer,
  userController.getUploadSignature
);

userRouter.post(
  "/profile/avatar",
  authenticate,
  languagePrefer,
  userController.saveAvatar
);

// :TODO:
// user route for forgotten password
module.exports = userRouter;
