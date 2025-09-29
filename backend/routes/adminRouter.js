const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");
const { authorization } = require("@middlewares/authorization");

const adminRouter = Router();

const adminController = require("@controllers/adminController");

adminRouter.get(
  "/users",
  authenticate,
  authorization,
  adminController.getUsers
);

module.exports = adminRouter;
