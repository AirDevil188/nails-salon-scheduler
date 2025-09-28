const db = require("@db/query");
const { verifyToken } = require("@utils/utils");

const checkInvitationStatus = async (req, res, next) => {
  const { token } = req.body;
  // check if the token is present
  try {
    const invitationToken = await db.findInvitationByToken(token);
    if (
      // if the token has the invitation status of code_verified let the user continue
      !invitationToken ||
      invitationToken.invitationStatus !== "code_verified"
    ) {
      console.log("fff");
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
  if (!authHeader || authHeader.startsWith("Bearer ")) {
    const error = new Error("authorization_err");
    error.status = 401;
    return next(error);
  }
  // remove the Bearer from the token
  const token = authHeader.split(" ")[1];

  // verify the token
  try {
    const decodedPayload = verifyToken(token);
    req.user = decodedPayload;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  checkInvitationStatus,
  authenticate,
};
