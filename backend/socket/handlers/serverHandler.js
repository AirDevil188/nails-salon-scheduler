const { adminHandler } = require("@socketHandlers/adminHandler");
const { userHandler } = require("@socketHandlers/userHandler");
const db = require("@db/query");
const { getIo } = require("../services/socketManager");

const serverHandler = (socket, next) => {
  const user = socket.user;

  if (!user) {
    console.error(
      "Critical Error: Attempted to run serverHandler on an unauthenticated socket. Disconnecting."
    );
    socket.disconnect(true);
    return;
  }

  if (user.role === "admin") {
    adminHandler(socket);
  } else if (user.role === "user") {
    userHandler(socket);
  }

  socket.on("disconnect", async (reason) => {
    console.log(`User ${user.id} disconnected. Reason: ${reason}`);

    // Update status in the database
    await db.updateUserOnlineStatus(user.id, false, new Date());

    // Broadcast status change (e.g., to the admin dashboard)
    const io = getIo();

    if (io) {
      io.to("admin-dashboard").emit("user.offline", {
        userId: user.id,
        timestamp: new Date(),
      });
    }
  });
};

module.exports = {
  serverHandler,
};
