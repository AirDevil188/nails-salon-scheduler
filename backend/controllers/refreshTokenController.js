const db = require("@db/query");
const { generateRefreshToken, signToken } = require("@utils/utils");
const { addDays } = require("date-fns/addDays");
const generateNewRefreshToken = async (req, res, next) => {
  /// get from validateRefreshToken middleware
  const { id, userId, isRevoked } = req?.refreshToken;

  if (isRevoked === true) {
    // Revoke all refresh tokens for this user and log them out.
    await db.revokeAllRefreshTokensFromUser(userId);
    const error = new Error("token_stolen_revoked_all");
    error.status = 401; // Unauthorized
    return next(error);
  }

  try {
    // invalidate the old token
    await db.invalidateRefreshToken(id);
    // generate new raw token value
    const newRefreshRawToken = generateRefreshToken();

    // create new refresh token expiration
    const newExpiresAt = addDays(new Date(), 30);

    // create the token in db
    const newRefreshToken = await db.createRefreshToken(
      newRefreshRawToken,
      userId,
      newExpiresAt
    );

    // see if the user is present with the id in db
    const findUser = await db.findUserById(userId);

    // if the user is not found throw 401 err
    if (!findUser) {
      const error = new Error("refresh_token_user_not_found");
      error.status = 401;
      return next(error);
    }

    const { password: _, ...rest } = findUser;
    const userInfo = Object.assign({}, rest);

    // access token payload
    const newPayload = {
      id: userInfo.id,
      role: userInfo.role,
    };
    // refresh token payload
    const refreshPayload = {
      id: newRefreshToken.id,
      userId: newRefreshToken.userId,
    };

    // new access token
    const accessToken = signToken(newPayload, "20sec", "access");
    // new refresh token
    const refreshToken = signToken(refreshPayload, "30d", "refresh");

    return res.status(200).json({
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
  } catch (err) {
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

const revokeOnLogout = async (req, res, next) => {
  const { id } = req?.refreshToken;

  if (!id) {
    const error = new Error("refresh_token_user_not_found");
    error.status = 401;
    return next(error);
  }
  try {
    await db.invalidateRefreshToken(id);

    return res.status(200).json({ message: "Logout successful." });
  } catch (err) {
    console.error("Error revoking token during logout:", err);

    // Check for specific error status from the helper function
    if (err.status) {
      return next(err);
    }

    const internalError = new Error(
      "An internal server error occurred during logout."
    );
    internalError.status = 500;
    return next(internalError);
  }
};
module.exports = {
  generateNewRefreshToken,
  revokeOnLogout,
};
