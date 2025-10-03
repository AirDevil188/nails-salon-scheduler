const { adminHandler } = require("@socketHandlers/adminHandler");
const { userHandler } = require("@socketHandlers/userHandler");

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
};

module.exports = {
  serverHandler,
};
