const { body, validationResult } = require("express-validator");
const { languages } = require("@utils/language");
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
  const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
  const type = languages[languageKey];

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

    // user payload for JWT
    const payload = {
      id: user.id,
      role: user.role,
    };

    // check if user has the refresh token is in the db and invalidate it
    const refreshToken = await db.findRefreshTokenByUserId(user.id);
    if (refreshToken) {
      await db.invalidateRefreshToken(user.id);
      console.log("Refresh token successfully invalidated");
    }

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
    const accessToken = await signToken(payload, "15m");

    // create new refreshToken

    // decode the accessToken token to get expiresAt
    const decodedToken = decodeToken(accessToken);
    const expiresAt = decodedToken.exp;

    res.status(200).json({
      // return successful response
      success: true,
      message: type.success_sign_in,
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
    const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
    const type = languages[languageKey];

    const invitation = req.invitation;
    // validate errs
    const errs = validationResult(req);

    // if there are validation errs
    if (!errs.isEmpty()) {
      // pickup the first message
      const validationErrors = errs.array().map((error) => error.msg);
      const error = new Error("Validation Error");
      error.name = "ValidationError";
      error.validationMessages = validationErrors; // Attach the array of message keys
      return next(error);
    }

    const { email, password, first_name, last_name, avatar } = req.body;

    try {
      // check if the user already exists
      const user = await db.findUser(invitation.email);

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
        invitation.email,
        hashedPassword,
        first_name,
        last_name,
        null,
        invitation.id
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

      // user payload for JWT
      const payload = {
        id: newUser.id,
        role: newUser.role,
      };

      // create accessToken
      const accessToken = await signToken(payload, "15m");
      const decodedToken = await decodeToken(accessToken);
      const expiresAt = decodedToken.exp;

      // update invitation status to accepted
      await db.acceptInvitationStatus(invitation.token, "accepted");

      return res.status(200).json({
        success: true,
        message: type.success_sign_up,
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
