const db = require("@db/query");

const managePushToken = async (req, res, next) => {
  const deviceToken = req.headers["x-push-token"];
  const id = req?.user.id;

  if (!deviceToken || !id) {
    console.error(
      "Skipping token upsert due to missing user ID or device token."
    );

    return next();
  }

  try {
    await db.upsertPushToken(id, deviceToken);
    return next();
  } catch (err) {
    console.error("Error during push token upsert:", err);
  }
};

module.exports = {
  managePushToken,
};
