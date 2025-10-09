const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");

const refreshTokenRouter = Router();

const refreshTokenController = require("@controllers/refreshTokenController");
const { languagePrefer } = require("@middlewares/language");

refreshTokenRouter.post(
  "/refresh",
  languagePrefer,
  refreshTokenController.validateAndIssueRefreshToken
);

module.exports = refreshTokenRouter;
