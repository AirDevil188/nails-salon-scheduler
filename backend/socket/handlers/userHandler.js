const userHandler = (socket) => {
  const user = socket.user;

  if (!user) {
    console.error("Attempted to run userHandler on unauthenticated socket");
    return;
  } else {
    socket.join(`user:${user.id}`);
    console.log(`User ${socket.user.id} joined 'user:${user.id} room`);
  }
};

module.exports = {
  userHandler,
};
