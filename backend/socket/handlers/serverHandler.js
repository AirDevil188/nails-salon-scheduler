const { adminHandler } = require("@socketHandlers/adminHandler");
const { userHandler } = require("@socketHandlers/userHandler");
const db = require("@db/query");

const serverHandler = (socket, next) => {
  const user = socket.user;

  if (!user) {
    console.error("Attempted to run serverHandler on the unauthorized socket");
    return;
  }
  if (user.role === "admin") {
    adminHandler(socket);
  } else if (user.role === "user") {
    userHandler(socket);
  }

  socket.on("disconnect", async (reason) => {
    console.log(`User ${user.id} disconnected. Reason: ${reason}`);

    await db.updateUserOnlineStatus(user.id, false, new Date());

    // 2. Broadcast status change (e.g., to the admin dashboard)
    io.to("admin-dashboard").emit("user.offline", {
      userId: user.id,
      timestamp: new Date(),
    });
  });
};

module.exports = {
  serverHandler,
};
