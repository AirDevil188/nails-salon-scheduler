const authorization = (req, res, next) => {
  if (req.user) {
    if (req.user.role === "admin") {
      return next();
    } else {
      const error = new Error("authorization_err");
      error.status = 403;
      return next(error);
    }
  }
  const error = new Error("authorization_err");
  error.status = 401;
  return next(error);
};

module.exports = {
  authorization,
};
