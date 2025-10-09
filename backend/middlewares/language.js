const db = require("@db/query");

const supportedLanguages = ["en", "sr"];

const sanitizeHeader = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }
  const primaryValue = value.split("-")[0].toLowerCase().trim();

  if (!supportedLanguages.includes(primaryValue)) {
    return null;
  }
  return primaryValue;
};

const languagePrefer = async (req, res, next) => {
  const defaultLanguage = "sr";
  let resolvedLanguage = null;
  let languageSource = null;

  const explicitAppHeader = req.get("x-app-language");

  const sanitizedHeader = sanitizeHeader(explicitAppHeader);

  // check for the client header
  if (sanitizedHeader) {
    resolvedLanguage = sanitizedHeader;
    languageSource = "Header";
  }

  // check the db presence
  if (!resolvedLanguage && req.user && req.user.id) {
    // Assuming a previous auth middleware attached req.user with a valid ID
    try {
      const { id } = req.user;
      const user = await db.findUserById(id);

      if (user && user.preferredLanguage) {
        const sanitizedHeader = sanitizeHeader(user.preferredLanguage);

        if (sanitizedHeader) {
          resolvedLanguage = sanitizedHeader;
          req.languageSource = "Database";
        }
      }
    } catch (err) {
      console.error("Error fetching user language preference:", err);
    }
  }

  // fallback to default
  if (!resolvedLanguage) {
    resolvedLanguage = defaultLanguage;
    req.languageSource = "Default";
  }

  req.resolvedLanguage = resolvedLanguage;
  req.languageSource = languageSource;

  console.error(req.resolvedLanguage);

  return next();
};

module.exports = { languagePrefer };
