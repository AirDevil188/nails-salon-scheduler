let io;

const setIo = (serverIo) => {
  io = serverIo;
};

const getIo = () => {
  if (!io) {
    console.error("Socket io is not initialized");
  }
  return io;
};

module.exports = {
  setIo,
  getIo,
};
