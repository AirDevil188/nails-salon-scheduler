const { createSocketAuthenticateError } = require("@utils/errorUtils");
const { verifyToken } = require("@utils/utils");
const db = require("@db/query.js");
const { getIo } = require("@socketServices/socketManager");

/// keep track of how many active sockets a user has
const connectionCount = new Map();

const authenticateSocketToken = async (socket, next) => {
  const io = getIo();
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(
      new Error(
        createSocketAuthenticateError("No authentication token provided", 401)
      )
    );
  }

  try {
    // Verify token and get user info
    const user = await verifyToken(token, "access");
    if (!user) {
      return next(
        new Error(
          createSocketAuthenticateError("Token invalid or expired", 403)
        )
      );
    }

    // attach the user info to socket
    socket.user = user;

    // each user gets their own room
    socket.join(`user:${user.id}`);

    // admins also join the admin-dashboard room
    if (user.role === "admin") {
      socket.join("admin-dashboard");
    }

    console.log(
      `[SOCKET AUTH] Socket ${socket.id} joined rooms:`,
      Array.from(socket.rooms)
    );

    // connection tracking
    const prevCount = connectionCount.get(user.id) || 0;
    connectionCount.set(user.id, prevCount + 1);

    // only mark the user active the first time
    if (prevCount === 0) {
      await db.updateUserOnlineStatus(user.id, true, new Date());
      io.emit("user.online", { userId: user.id, timestamp: new Date() });
      console.log(`[SOCKET AUTH] User ${user.id} marked ONLINE (1st socket).`);
    } else {
      console.log(
        `[SOCKET AUTH] User ${user.id} has ${prevCount + 1} active sockets.`
      );
    }

    socket.on("disconnect", async () => {
      const current = connectionCount.get(user.id) || 1;
      const newCount = current - 1;

      if (newCount <= 0) {
        // Last socket disconnected
        connectionCount.delete(user.id);
        await db.updateUserOnlineStatus(user.id, false, new Date());
        io.emit("user.offline", { userId: user.id, timestamp: new Date() });
        console.log(
          `[SOCKET AUTH] User ${user.id} marked OFFLINE (all sockets closed).`
        );
      } else {
        // Some sockets still active
        connectionCount.set(user.id, newCount);
        console.log(
          `[SOCKET AUTH] User ${user.id} still has ${newCount} active sockets.`
        );
      }
    });

    return next();
  } catch (err) {
    console.error(err);
    return next(
      new Error(
        createSocketAuthenticateError("Server failed to verify token", 500)
      )
    );
  }
};

module.exports = { authenticateSocketToken };
