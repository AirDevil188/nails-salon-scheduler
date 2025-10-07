const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");

const refreshTokenRouter = Router();

const refreshTokenController = require("@controllers/refreshTokenController");

refreshTokenRouter.post(
  "/refresh",
  refreshTokenController.validateAndIssueRefreshToken
);

module.exports = refreshTokenRouter;
