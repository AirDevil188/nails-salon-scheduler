const adminHandler = (socket) => {
  const user = socket.user;

  // if user is not found throw an error
  if (!user) {
    console.error("Attempted to run adminHandler on unauthenticated socket");
    return;
  } else {
    // join the admin to specific admin room
    socket.join("admin-dashboard");
    console.log(`Admin user ${socket.user.id} joined 'admin-dashboard' room.`);
    // join the admin to the specific user room
    socket.join(`user:${user.id}`);
    console.log(`Admin user ${socket.user.id} joined 'user:${user.id} room`);
  }
};

module.exports = { adminHandler };
