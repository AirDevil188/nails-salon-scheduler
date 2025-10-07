const { body, validationResult } = require("express-validator");
const { languages } = require("@utils/language");
const db = require("@db/query");
const { getIo } = require("@socketServices/socketManager");
const cloudinary = require("../config/cloudinary");
const {
  verifyHash,
  signToken,
  decodeToken,
  generateRefreshToken,
  createHashedPassword,
} = require("@utils/utils");
const { userSaveAvatar } = require("../db/query");
const { addDays } = require("date-fns/addDays");

const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const profile = await db.findUserProfile(id);
    return res.status(200).json({
      profile: profile,
    });
  } catch (err) {
    return next(err);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const io = getIo();
    const { id } = req.user;
    await db.deleteUser(id);
    // return 204 status because there is no content to return
    io.to("admin-dashboard").emit("admin:userDeleted", id);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

const updateProfile = [
  body("first_name").notEmpty().withMessage("validator_first_name").optional(),
  body("last_name").notEmpty().withMessage("validator_last_name").optional(),
  async (req, res, next) => {
    try {
      const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
      const type = languages[languageKey];

      const io = getIo();
      const { id } = req.user;
      const { first_name, last_name } = req.body;
      const profile = await db.updateUserProfile(id, first_name, last_name);
      if (!profile) {
        return res.status(200).json({
          message: type.profile_update_no_values_provided,
        });
      }
      io.to("admin-dashboard").emit("admin:userProfileUpdated", {
        email: profile.email,
        id: profile.id,
      });
      io.to(`user:${profile.id}`).emit("user:userProfileUpdated", { profile });
      return res.status(200).json({
        profile: profile,
      });
    } catch (err) {
      return next(err);
    }
  },
];

const changeUserPassword = [
  body("current_password")
    .isLength({ min: 6 })
    .withMessage("validator_password_min"),
  body("new_password")
    .isLength({ min: 6 })
    .withMessage("validator_password_min"),
  // custom confirm_password checker
  body("confirm_new_password").custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error("validator_confirm_password");
    }
    return true;
  }),

  async (req, res, next) => {
    try {
      const { id } = req.user;
      const { current_password, new_password } = req.body;

      // get the old password from the db for the current user
      const { password } = await db.findUserById(id);
      // compare current password with the password that is stored in db
      const isMatch = await verifyHash(current_password, password);

      if (isMatch) {
        // hash the plain password
        const newHashedPassword = await createHashedPassword(new_password);

        // store the new hashed password in the db
        await db.changeUserPassword(id, newHashedPassword);

        return res.status(204).end();
      } else {
        const error = new Error("validator_old_password_no_match");
        error.status = 401;
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
  },
];

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

    //. create refreshToken
    const refreshTokenRaw = await generateRefreshToken();
    console.error(refreshTokenRaw, "POKEMONS");
    console.log(user.id);
    if (!refreshTokenRaw) {
      const error = new Error("general_server_err");
      console.error(error);
      error.status = 500;
      return next(error);
    }
    console.log("SSUCC");

    // push the token to the db
    const tokens = await db.createRefreshToken(
      refreshTokenRaw,
      user.id,
      addDays(new Date(), 30)
    );
    console.error(tokens);

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
      error.status = 400;
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

      await db.createRefreshToken(
        refreshTokenRaw,
        newUser.id,
        addDays(new Date(), 30)
      );

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

const getUploadSignature = async (req, res, next) => {
  const { id } = req.user;

  const publicId = `${id}_avatar`; // assign the public id so that we can find the images that were posted by that user in case of the deletion
  const timestamp = Math.round(new Date().getTime() / 1000);
  // options
  const options = {
    timestamp: timestamp,
    eager: "c_pad,h_300,w_400|c_crop,h_200,w_260",
    folder: "nails_appointment_app/avatars",
    publicId: `${publicId}`,
  };

  try {
    // assign signature
    const signature = cloudinary.utils.api_sign_request(
      options,
      process.env.CLOUDINARY_API_SECRET
    );
    return res.status(200).json({
      signature,
      timestamp: options.timestamp,
      publicId: `nails_appointment_app/${publicId}`,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: "/nails_appointment/avatars",
    });
  } catch (err) {
    return next(err);
  }
};

const saveAvatar = async (req, res, next) => {
  try {
    const io = getIo();
    const { publicId } = req.body;
    const { id } = req.user;

    // check if the publicId is present
    if (!publicId) {
      const error = new Error("validator_public_id_avatar");
      error.status = 400;
      return next(error);
    }

    // get the user old avatar publicId
    const user = await db.getOldPublicAvatarId(id);
    // assign user avatar publicId to oldPublicId
    const oldPublicId = user?.avatar;

    // main func if this fails exit the middleware
    const avatar = await db.userSaveAvatar(id, publicId);
    io.to("admin-dashboard").emit("admin:userAvatarUpdated", publicId);
    io.to(`user:${id}`).emit("user:userAvatarUpdated", publicId);
    // if the avatar already exists delete it
    if (oldPublicId && oldPublicId !== publicId) {
      cloudinary.uploader.destroy(oldPublicId, (err, result) => {
        if (err) {
          console.error(
            `Cloudinary cleanup failed for ${oldPublicId}. Error:`,
            err
          );
        } else {
          console.log(
            `Cloudinary cleanup successful for ${oldPublicId}. Result:`,
            result.result
          );
        }
      });
    }

    res.status(200).json({
      avatar: avatar,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUserProfile,
  getUploadSignature,
  deleteProfile,
  saveAvatar,
  updateProfile,
  changeUserPassword,
  signInUser,
  signUpUser,
};
