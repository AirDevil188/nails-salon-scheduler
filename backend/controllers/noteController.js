const { validationResult, body } = require("express-validator");
const { getIo } = require("../socket/services/socketManager");
const db = require("@db/query");

const getNotes = async (req, res, next) => {
  try {
    const { limit = "25", page = "1", orderBy, search } = req.query;

    const safeLimit = parseInt(limit, 10) || 25;
    const safePage = parseInt(page, 10) || 1;

    const { notes, totalCount } = await db.adminGetAllAppointments({
      limit: safeLimit,
      page: safePage,
      orderBy,
      search,
    });

    return res.status(200).json({
      notes: notes,
      limit: safeLimit,
      page: safePage,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
    });
  } catch (err) {
    return next(err);
  }
};

const getNoteDetails = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { noteId } = req.params;
    const note = await db.adminGetNoteDetails(noteId, id);

    return res.status(200).json({
      note: note,
    });
  } catch (err) {
    return next(err);
  }
};

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
      const { title, content } = req.body;
      // create note
      const note = await db.adminCreateNote(title, content, id);
      io.to("admin-dashboard").emit("admin:noteCreate", note);
      return res.status(200).json({
        note: note,
      });
    } catch (err) {
      return next(err);
    }
  },
];

const updateNote = [
  body("title").trim().notEmpty().withMessage("validator_notes_title").optional,
  body("content").trim().notEmpty().withMessage("validator_notes_content")
    .optional,

  async (req, res, next) => {
    const errs = validationResult(req);
    const io = getIo();

    if (!errs.isEmpty()) {
      // map all messages
      const validationErrors = errs.array().map((error) => error.msg);
      // create error obj message
      const error = new Error("Validation Error");
      error.status = 400;
      error.name = "ValidationError";
      error.validationMessages = validationErrors;
      return next(error);
    }
    try {
      const { id } = req.user;
      const { noteId } = req.params;
      const { title, content } = req.body;
      const note = await db.adminUpdateNote(title, content, noteId, id);
      io.to("admin-dashboard").emit("admin:updatedNote", note);
      console.log(
        `Sent updated appointment alert to the 'admin-dashboard' room. for the note ${note.id}`
      );
      return res.status(200).json({
        note: note,
      });
    } catch (err) {
      return next(err);
    }
  },
];

const deleteNote = async (req, res, next) => {
  try {
    const io = getIo();
    const { noteId } = req.params;
    const deleteResult = await db.adminDeleteNote(noteId);

    if (deleteResult.count > 0) {
      io.to("admin-dashboard").emit("admin:noteDeleted", noteId);
      console.log(
        `Sent note deletion alert for invitation: ${noteId} to the 'admin-dashboard' room.`
      );
    }
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getNotes,
  getNoteDetails,
  createNote,
  updateNote,
  deleteNote,
};
