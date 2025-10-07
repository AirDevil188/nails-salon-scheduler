const { verifyToken } = require("@utils/utils");
const db = require("@db/query");
const {
  verifyHash,
  generateRefreshToken,
  createHashedPassword,
  signToken,
} = require("@utils/utils");
const { addDays } = require("date-fns/addDays");
const validateAndIssueRefreshToken = async (req, res, next) => {
  // /auth/refresh endpoint POST
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("authorization_err");
    error.status = 401;
    return next(err);
  }
  // split the token value and Bearer
  const token = authHeader.split(" ")[1];

  try {
    // verify the token
    const decodedPayload = verifyToken(token);

    // check if the refresh token matches with the userId from the payload
    const refreshToken = await db.findRefreshTokenByUserId(decodedPayload.id);

    // if the refresh token is not found
    if (!refreshToken) {
      const error = new Error("refresh_token_session_expired");
      error.status = 401;
      return next(error);
    }

    // verify if the raw refresh token matches the hash in db
    const isMatch = verifyHash(token, refreshToken.token);

    // if the provided token doesn't match with hashed token value in db trow an err
    if (!isMatch) {
      // invalidate all refresh tokens
      await db.invalidateRefreshToken(decodedPayload.id);
      const error = new Error("refresh_token_stale_or_invalid");
      error.status = 401;
      return next(error);
    }

    // get the user
    const user = await db.findUserById(decodedPayload.id);

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

    // hash the raw token value
    const hashedRefreshToken = await createHashedPassword(newRefreshRawToken);

    // create new refresh token expiration
    const newExpiresAt = addDays(new Date(), 30);

    // update the token value in db with new one
    await db.updateRefreshToken(
      decodedPayload.id,
      hashedRefreshToken,
      newExpiresAt
    );

    // new access token
    const newAccessToken = signToken(newPayload, "15m");

    return res.status(200).json({
      refreshToken: newRefreshRawToken,
      accessToken: newAccessToken,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      const error = new Error("jwt_invalid_or_expired");
      error.status = 401;
      return next(error);
    }
  }
};
module.exports = {
  validateAndIssueRefreshToken,
};
