const db = require("@db/query");
const { generateRefreshToken, signToken } = require("@utils/utils");
const { addDays } = require("date-fns/addDays");
const generateNewRefreshToken = async (req, res, next) => {
  /// get from validateRefreshToken middleware
  const { id, userId } = req?.refreshToken;

  try {
    // generate new raw token value
    const newRefreshRawToken = generateRefreshToken();

    // create new refresh token expiration
    const newExpiresAt = addDays(new Date(), 30);

    // update the token value in db with new one
    const { findUser, updateToken } = await db.updateRefreshToken(
      id,
      newRefreshRawToken,
      newExpiresAt,
      userId
    ); // this is upsert method i think that is better than update

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
      id: updateToken.id,
      userId: updateToken.userId,
    };

    // new access token
    const accessToken = signToken(newPayload, "15m", "access");
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
module.exports = {
  generateNewRefreshToken,
};
