const {
  PrismaClientKnownRequestError,
} = require("@prisma/client/runtime/library");
const { languages } = require("@utils/language");

const errorHandler = (err, req, res, next) => {
  console.log(err.stack); // Log all errs for debugging purposes

  const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
  const type = languages[languageKey];

  let statusErrCode = err.status || 500;
  let statusErrMessage;
  let statusErrMessages = [];
  let validationDetails;

  // handle validation errs
  if (err.name === "ValidationError") {
    statusErrCode = 400;
  }
  // if there are validation errors push them to an array
  if (err.validationMessages && Array.isArray(err.validationMessages)) {
    validationDetails = err.validationMessages;
    for (const msg of validationDetails) {
      if (type[msg]) {
        statusErrMessages.push(type[msg]);
      } else {
        statusErrMessages.push(msg);
      }
    }
  } else {
    // if there are no validation errors throw general err
    statusErrMessage = type.general_server_err;
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

  // declare resBody Obj
  const resBody = {
    success: false,
    statusErrMessage,
  };

  // assign validationErrors to res body only if there are validation errs
  if (validationDetails) {
    resBody.validationErrors = statusErrMessages;
  }
  return res.status(statusErrCode).json(resBody);
};

module.exports = errorHandler;
