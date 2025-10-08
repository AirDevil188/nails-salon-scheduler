const { validationResult, body } = require("express-validator");
const { getIo } = require("../socket/services/socketManager");
const db = require("@db/query");

const createNote = [
  body("title").trim().notEmpty().withMessage("validator_notes_title"),
  body("content").trim().notEmpty().withMessage("validator_notes_content"),

  async (req, res, next) => {
    const errs = validationResult(req);
    const io = getIo();

    if (!errs.isEmpty()) {
      // map all messages
      const validationErrors = errs.array().map((error) => error.msg);
      // create error message
      const error = new Error("Validation Error");
      error.status = 400;
      error.name = "ValidationError";
      error.validationMessages = validationErrors;
      return next(error);
    }
    try {
      const { id } = req.user;
      const { title, content, userId } = req.body;
      // create note
      const note = await db.adminCreateNote(title, content, id);
      io.to("admin-dashboard").emit("admin:noteCreate", note.id);
    } catch (err) {
      return next(err);
    }
  },
];

module.exports = {
  createNote,
};
