const db = require("@db/query");
const { generateRefreshToken, signToken } = require("@utils/utils");
const { addDays } = require("date-fns/addDays");
const validateAndIssueRefreshToken = async (req, res, next) => {
  // /auth/refresh endpoint POST
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("authorization_err");
    error.status = 401;
    return next(error);
  }
  // split the token value and Bearer
  const token = authHeader.split(" ")[1];

  try {
    // check if the refresh token matches with the userId from the payload
    const refreshToken = await db.findRefreshTokenByTokenValue(token);

    // if the refresh token is not found
    if (!refreshToken) {
      const error = new Error("refresh_token_session_expired");
      error.status = 401;
      return next(error);
    }

    if (refreshToken.expiresAt < new Date()) {
      await db.invalidateRefreshToken(refreshToken.id); // invalidates by token id
      const error = new Error("refresh_token_session_expired");
      error.status = 401;
      return next(error);
    }

    // get the user
    const user = await db.findUserById(refreshToken.userId);

    // if the user is not found throw 401 err
    if (!user) {
      const error = new Error("refresh_token_user_not_found");
      error.status = 401;
      return next(error);
    }

    const { password: _, ...rest } = user;
    const userInfo = Object.assign({}, rest);

    const newPayload = {
      id: userInfo.id,
      role: userInfo.role,
    };

    // generate new raw token value
    const newRefreshRawToken = generateRefreshToken();

    // create new refresh token expiration
    const newExpiresAt = addDays(new Date(), 30);

    // update the token value in db with new one
    await db.updateRefreshToken(
      refreshToken.id,
      newRefreshRawToken,
      newExpiresAt
    );

    // new access token
    const newAccessToken = signToken(newPayload, "15m");

    return res.status(200).json({
      refreshToken: newRefreshRawToken,
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Refresh Token Process Error:", err);

    if (err.status) {
      return next(err);
    }
    const internalError = new Error(
      "An internal server error occurred during token refresh."
    );
    internalError.status = 500;
    return next(internalError);
  }
};
module.exports = {
  validateAndIssueRefreshToken,
};
