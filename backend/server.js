require("module-alias/register");
const { httpServer } = require("@root/app");
const { authenticateSocketToken } = require("@socketMiddlewares/socketAuth");
const { serverHandler } = require("@socketHandlers/serverHandler");
const { getIo } = require("@socketServices/socketManager");
const { startReceiptScheduler } = require("@scheduler/receiptProcessor");

const io = getIo();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

io.use(authenticateSocketToken);

io.on("connection", (socket) => {
  console.log(`[CONNECTION] Socket ${socket.id} connected.`);

  serverHandler(socket);
});

startReceiptScheduler();

httpServer.listen(PORT, HOST, () => {
  console.log(`Socket.IO Server listening on http://localhost:${PORT}`);
  console.log(`Host: ${HOST}`);
});
