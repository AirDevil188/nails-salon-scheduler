const { createSocketAuthenticateError } = require("@utils/errorUtils");
const { verifyToken } = require("@utils/utils");

const authenticateSocketToken = async (socket, next) => {
  // set the token from the socket handshake
  const token = socket.handshake.auth.token;

  if (!token) {
    console.error("Authentication failed no token was provided");
    const error = new Error(
      createSocketAuthenticateError("No authentication token was provided", 401)
    );
    return next(error);
  }
  // verify the token
  try {
    const user = await verifyToken(token);

    // if the token is not valid throw an error
    if (!user) {
      const error = new Error(
        createSocketAuthenticateError("Token is invalid or expired", 403)
      );
      return next(error);
    }
    // if the token is valid assign the token to the socket.user
    socket.user = user;
    return next();
  } catch (err) {
    return err;
  }
};

module.exports = {
  authenticateSocketToken,
};
