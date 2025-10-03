const { createSocketAuthenticateError } = require("@utils/errorUtils");
const { verifyToken } = require("@utils/utils");
const db = require("@db/query.js");
const { getIo } = require("@socketServices/socketManager");

const authenticateSocketToken = async (socket, next) => {
  const io = getIo();

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

    await db.updateUserOnlineStatus(user.id, true, new Date());
    // if the token is valid assign the token to the socket.user
    socket.user = user;

    console.log(`Prisma: User ${user.id} status successfully set to ONLINE.`);

    io.emit("user.online", { userId: user.id, timestamp: new Date() });
    return next();
  } catch (err) {
    const error = new Error(
      createSocketAuthenticateError("Server failed to verify token", 500)
    );
    return next(error);
  }
};

module.exports = {
  authenticateSocketToken,
};
