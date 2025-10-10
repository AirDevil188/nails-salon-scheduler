require("module-alias/register");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
// require errHandler
const errorHandler = require("@middlewares/errorHandler");

// require routers

const userRouter = require("@routes/userRouter");
const adminRouter = require("@routes/adminRouter");
const invitationRouter = require("@routes/invitationRouter");
const appointmentRouter = require("@routes/appointmentRouter");
const refreshTokenRouter = require("@routes/refreshTokenRouter");

const { setIo } = require("@socketServices/socketManager");

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: "*", // Allows all origins to connect easiest for development
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});
setIo(io);

app.use(express.json());

// create /api endpoint
const apiRouter = express.Router();
// initialize /api endpoint
app.use("/api", apiRouter);

// API routers
apiRouter.use("/users", userRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/invitations", invitationRouter);
apiRouter.use("/appointments", appointmentRouter);
apiRouter.use("/token", refreshTokenRouter);

app.use(errorHandler);

// do we use it here

module.exports = { httpServer, io, app };
