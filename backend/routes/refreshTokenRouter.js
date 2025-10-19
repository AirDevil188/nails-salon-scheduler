const { Router } = require("express");
const { validateRefreshToken } = require("@middlewares/authenticate");
const refreshTokenRouter = Router();

const refreshTokenController = require("@controllers/refreshTokenController");
const { languagePrefer } = require("@middlewares/language");
const { managePushToken } = require("@middlewares/pushToken");

refreshTokenRouter.post(
  "/refresh",
  languagePrefer,
  validateRefreshToken,
  managePushToken,
  refreshTokenController.generateNewRefreshToken
);

refreshTokenRouter.delete(
  "/refresh/invalidate",
  languagePrefer,
  validateRefreshToken,
  refreshTokenController.revokeOnLogout
);

module.exports = refreshTokenRouter;
