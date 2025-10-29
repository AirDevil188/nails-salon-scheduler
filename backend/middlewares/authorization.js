const authorization = (req, res, next) => {
  if (req.user) {
    // --- DIAGNOSTIC LOGS ---
    console.log("--- AUTHORIZATION CHECK ---");
    console.log(`User ID: ${req.user.id}`);
    console.log(`Role in DB/Token: [${req.user.role}]`);
    console.log(`Type of Role: ${typeof req.user.role}`);
    console.log(`Comparison Result: ${req.user.role === "admin"}`);
    console.log("---------------------------");
    // -----------------------

    if (req.user.role === "admin") {
      console.log(req.user, "ADMIN ACCESS GRANTED");
      return next();
    } else {
      // This is the block that is causing the 403
      const error = new Error("authorization_err: Role mismatch or not admin");
      error.status = 403;
      return next(error);
    }
  }

  // This is the 401 path (user missing)
  const error = new Error("authorization_err: User not authenticated");
  error.status = 401;
  return next(error);
};

module.exports = {
  authorization,
};
