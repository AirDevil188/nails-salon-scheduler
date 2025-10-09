const languagePrefer = (req, res, next) => {
  // check for the client header
  // if it is null or undefined set sr as preferred language
  const clientHeader = req.headers["accept-language"] || "sr";

  // split the string example en-US
  const resolvedLanguage = clientHeader.split(",")[0].trim();

  // attach the req reserved language to req object
  req.resolvedLanguage = resolvedLanguage;

  next();
};

module.exports = { languagePrefer };
