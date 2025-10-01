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
  let statusErrMessages = [];
  let validationDetails;

  // handle custom errors like 401 errs
  if (err.message && type[err.message] && statusErrCode !== 400) {
    statusErrMessage = type[err.message];
  }

  //handle validation errors
  // if there are validation errors push them to an array
  if (err.name === "ValidationError" && Array.isArray(err.validationMessages)) {
    validationDetails = err.validationMessages;
    for (const msg of validationDetails) {
      if (type[msg]) {
        statusErrMessages.push(type[msg]);
      } else {
        statusErrMessages.push(msg);
      }
    }

    // set the main status err msg to validator
    if (statusErrMessages.length > 0) {
      statusErrMessage = type.general_validator_err;
    } else {
      // Fallback for an unknown validation issue
      statusErrMessage = type.general_validator_err;
    }
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
    resBody.validationDetails = statusErrMessages;
  }

  return res.status(statusErrCode).json(resBody);
};

module.exports = errorHandler;
