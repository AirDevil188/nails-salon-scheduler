const {
  PrismaClientKnownRequestError,
} = require("@prisma/client/runtime/library");
const { languages } = require("@utils/language");

const errorHandler = (err, req, res, next) => {
  console.log(err.stack); // Log all errs for debugging purposes

  const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
  const type = languages[languageKey];

  let statusErrCode = err.status || 500;
  let statusErrMessage = type.general_server_err;
  // handle validation errs
  if (err.name === "ValidationError") {
    statusErrCode = 400;
    statusErrMessage = type[err.message] || err.message; // Fallback option just in case if it can't find the right language key from languages module
  }

  // handle Prisma specific errs
  if (err instanceof PrismaClientKnownRequestError) {
    // switch based on err code
    switch (err.code) {
      case "P2002":
        statusErrCode = 409;
        statusErrMessage = type.conflict_server_err;
        break;

      case "P2025":
        statusErrCode = 404;
        statusErrMessage = type.request_server_err;
        break;
      default:
        statusErrCode = 500;
        statusErrMessage = type.general_server_err;
        break;
    }
  }
  res.status(statusErrCode).json({
    success: false,
    statusErrMessage,
  });
};

module.exports = errorHandler;
