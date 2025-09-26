const { body, validationResult } = require("express-validator");
const db = require("@db/query");
const {
  verifyHash,
  signToken,
  decodeToken,
  generateRefreshToken,
  createHashedPassword,
  oneWeekFromNow,
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

    const { password: _, ...rest } = user;

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
    await db.createRefreshToken(refreshTokenRaw, user.id, oneWeekFromNow());

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

const signUpUser = [
  body("email").isEmail().withMessage("validator_email_invalid"),

  body("password").isLength({ min: 6 }).withMessage("validator_password_min"),

  // custom confirm_password checker
  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("validator_confirm_password");
    }
    return true;
  }),
  body("first_name").notEmpty().withMessage("validator_first_name"),
  body("last_name").notEmpty().withMessage("validator_last_name"),

  async (req, res, next) => {
    // validate errs
    const errs = validationResult(req);

    // if there are validation errs
    if (!errs.isEmpty()) {
      // pickup the first message
      const validationErr = errs.array()[0];
      const statusErrMessage = validationErr.msg;

      // create costume err obj
      const error = new Error(statusErrMessage);
      error.name = "ValidationError";
      return next(error);
    }

    const { email, password, first_name, last_name, avatar } = req.body;

    try {
      // check if the user already exists
      const user = await db.findUser(email);

      // if the user exists throw an validation err
      if (user) {
        const error = new Error("validator_email");
        error.status = 400;
        return next(error);
      }

      // hash the password
      const hashedPassword = await createHashedPassword(password);

      // create the new user
      const newUser = await db.createUser(
        email,
        hashedPassword,
        first_name,
        last_name,
        null
      );
      const refreshTokenRaw = generateRefreshToken();

      if (!refreshTokenRaw) {
        const error = new Error("general_server_err");
        error.status = 500;
        return next(error);
      }

      // push the refreshToken in the db
      const time = oneWeekFromNow();
      await db.createRefreshToken(refreshTokenRaw, newUser.id, time);

      // get the new UserInfo
      const { password: _, ...rest } = newUser;

      const userInfo = Object.assign({}, { ...rest });

      // create accessToken
      const accessToken = await signToken(userInfo);
      const decodedToken = await decodeToken(accessToken);
      const expiresAt = decodedToken.exp;

      return res.status(200).json({
        success: true,
        message: "User successfully created",
        accessToken: accessToken,
        refreshToken: refreshTokenRaw,
        userInfo: userInfo,
        expiresAt: expiresAt,
      });
    } catch (err) {
      return next(err); // pass any unexpected errors to errorHandler
    }
  },
];
module.exports = {
  signInUser,
  signUpUser,
};
