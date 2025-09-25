const { body, validationResult } = require("express-validator");
const db = require("@db/query");
const {
  verifyHash,
  signToken,
  decodeToken,
  generateRefreshToken,
} = require("@utils/utils");

const signInUser = async (req, res, next) => {
  // Check for the validation errs using express-validator

  const errs = validationResult(req);

  // if there are errs
  if (!errs.isEmpty()) {
    // pickup the first message
    const validationErr = errs.array()[0];
    const statusErrMessage = validationErr.msg;

    // create a costume Err obj
    const error = new Error(statusErrMessage);
    error.name = "ValidationError";
    error.status = 400;

    return next(error);
  }

  const { email, password } = req.body;

  try {
    // find the user in the DB
    const user = await db.findUser(email);

    // if the user is not found throw 401 err
    if (!user) {
      const error = new Error("validator_email_password_incorrect");
      error.status = 401;
      return next(error);
    }

    // compare password with hashedPassword
    const isMatch = await verifyHash(password, user.password);

    // if password is incorrect
    if (!isMatch) {
      const error = new Error("validator_email_password_incorrect");
      error.status = 401;
      return next(error);
    }

    // if there are no errs proceed with user logging

    const { password, ...rest } = user;

    const userInfo = Object.assign({}, { ...rest });

    // check if user has the refresh token is in the db and invalidate it
    await db.invalidateRefreshToken(user.id);

    //. create refreshToken
    const refreshTokenRaw = await generateRefreshToken();
    if (!refreshTokenRaw) {
      const error = new Error("general_server_err");
      error.status = 500;
      return next(error);
    }
    // push the token to the db
    await db.createRefreshToken(refreshTokenRaw, user.id);

    // sign the token
    const accessToken = await signToken(userInfo);

    // create new refreshToken

    // decode the accessToken token to get expiresAt
    const decodedToken = decodeToken(accessToken);
    const expiresAt = decodedToken.exp;

    res.status(200).json({
      // return successful response
      success: true,
      message: "User logged in successfully",
      accessToken,
      refreshToken: refreshTokenRaw,
      userInfo,
      expiresAt,
    });
  } catch (err) {
    console.error(err);
    return next(err); // catch any unexpected errs and pass it to the errorHandler
  }
};

module.exports = {
  signInUser,
};
