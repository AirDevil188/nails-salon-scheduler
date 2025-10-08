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

noteRouter.delete(
  "/notes/:noteId",
  authenticate,
  authorization,
  noteController.deleteNote
);

module.exports = noteRouter;
