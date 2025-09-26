const { Router } = require("express");

const userController = require("@controllers/userController");

const userRouter = Router();

userRouter.post("/sign-in", userController.signInUser);

userRouter.post("/sign-up", userController.signUpUser);

module.exports = userRouter;
