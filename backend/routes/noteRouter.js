const { Router } = require("express");
const { authenticate } = require("@middlewares/authenticate");
const { authorization } = require("@middlewares/authorization");

const noteController = require("@controllers/noteController");

const noteRouter = Router();

noteRouter.post(
  "/notes/new",
  authenticate,
  authorization,
  noteController.createNote
);

module.exports = noteRouter;
