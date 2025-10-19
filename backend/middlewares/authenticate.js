const db = require("@db/query");
const { verifyToken } = require("@utils/utils");

const checkInvitationStatus = async (req, res, next) => {
  const token = req.body.invitationToken;
  console.log(token, "BACKEND");

  // check if the token is present
  try {
    const decodedToken = verifyToken(token, "invitation");
    console.log(decodedToken, "decoded");
    const invitationToken = await db.findInvitationByToken(decodedToken.jti);

    if (
      // if the token has the invitation status of code_verified let the user continue
      !invitationToken ||
      invitationToken.invitationStatus !== "code_verified"
    ) {
      const error = new Error("authorization_err");
      error.status = 401;
      return next(error);
    }
    // put the invitation obj to the req so that we can use it in the controller
    req.invitation = invitationToken;
    next();
  } catch (err) {
    return next(err);
  }
};

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // check if the req has authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("authorization_err");
    error.status = 401;
    return next(error);
  }
  // remove the Bearer from the token
  const token = authHeader.split(" ")[1];

  // verify the token
  try {
    const decodedPayload = verifyToken(token, "access");
    req.user = decodedPayload;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      const authError = new Error("token_expired_or_invalid");
      authError.status = 401; // Unauthorized - This triggers the frontend interceptor
      return next(authError);
    }

    console.error("Unexpected authentication error:", err.message);
    return next(err);
  }
};

const validateRefreshToken = async (req, res, next) => {
  const token = req.body.refreshToken;

  if (!token) {
    console.warn("Refresh token missing in request body.");
    const error = new Error("authorization_err");
    error.status = 401;
    return next(error);
  }
  try {
    const decodedPayload = verifyToken(token, "refresh");
    const tokenId = decodedPayload.id;

    const tokenRecord = await db.findRefreshTokenByTokenId(tokenId);

    if (!tokenRecord) {
      console.warn(`Token ID ${tokenId} not found in DB.`);
      const error = new Error("authorization_err: token_not_found");
      error.status = 401;
      return next(error);
    }

    req.refreshToken = tokenRecord;
    req.user = tokenRecord.userId;
    return next();
  } catch (err) {
    const error = new Error("authorization_err");
    error.status = 401;
    return next(error);
  }
};

module.exports = {
  checkInvitationStatus,
  authenticate,
  validateRefreshToken,
};
