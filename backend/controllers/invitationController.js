const db = require("@db/query");
const { generateRefreshToken, sendVerificationCode } = require("@utils/utils");
const { addHours } = require("date-fns/addHours");
const crypto = require("crypto");
const { addMinutes } = require("date-fns/addMinutes");

const generateInvitation = async (req, res, next) => {
  const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
  const type = languages[languageKey];

  const { email } = req.body;

  try {
    // generate new invitation
    const generateRawInvitationToken = generateRefreshToken();
    if (!generateRawInvitationToken) {
      const error = new Error("general_server_err");
      error.status = 500;
      return next(error);
    }
    // try to find an invitation that already exists
    const existingInvitation = await db.findInvitation(email);

    let invitation;

    if (existingInvitation) {
      // if the invitation with the email already exists update it
      invitation = await db.updateInvitation(
        generateRawInvitationToken,
        email,
        addHours(new Date(), 8)
      );
    } else {
      // if the invitation is not found create a new one
      invitation = await db.createInvitation(
        generateRawInvitationToken,
        email,
        addHours(new Date(), 8)
      );
    }

    // generate new link
    console.log("Invitation link successfully created");
    return res.status(200).json({
      success: true,
      message: type.success_invitation_link,
      invitationLink: invitation,
    });
  } catch (err) {
    return next(err); // catch unexpected errs and send them to the errHandler
  }
};

const validateInvitation = async (req, res, next) => {
  const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
  const type = languages[languageKey];
  // get the token from params from URL
  const now = new Date();
  const { token } = req.body;

  let invitation;
  try {
    // find the invitation based on the token
    invitation = await db.findInvitationByToken(token);
    // check if the invitation is not found OR expired
    if (!invitation || invitation.expiresAt < now) {
      // if the invitation was found but expired invalidate/delete it
      if (invitation && invitation.expiresAt < now) {
        await db.invalidateInvitation(invitation);
        console.log("Deleted expired invitation");
      }
      const error = new Error("authorization_err");
      error.status = 401;
      return next(error);
    }

    // check if the invitation is already code_verified
    if (invitation.invitationStatus === "code_verified") {
      return res.status(200).json({
        success: true,
        message: type.success_invitation_and_code_already_verified,
        invitationToken: token,
        redirect: true,
      });
    }

    // if it is found and not expired and the status is pending

    // generate random 6code
    const randomCode = crypto.randomInt(100000, 999999 + 1);
    // create authorization code that will be tied to this token in db
    await db.createInvitationCode(
      invitation.token,
      randomCode,
      addMinutes(new Date(), 5)
    );
    // send an email to the user that wants to register
    await sendVerificationCode(invitation.email, randomCode);
    return res.status(200).json({
      success: true,
      invitationToken: token,
      message: type.success_invitation_verification_code_sent,
    });
  } catch (err) {
    return next(err);
  }
};

const verifyInvitationCode = async (req, res, next) => {
  const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
  const type = languages[languageKey];
  const { code, token } = req.body;
  let validateCode;
  const now = new Date();

  // find the code in the db
  try {
    validateCode = await db.findInvitationCode(token, Number(code), now);

    // check if the code is not found OR expired
    if (!validateCode) {
      const error = new Error("authenticate_code_err");
      error.status = 401;
      return next(error);
    }

    // change the status of the invitation to the code_verified
    await db.verifyInvitationStatus(token, "code_verified");
    res.status(200).json({
      success: true,
      message: type.success_invitation_verification_code,
      email: validateCode.email,
    });
  } catch (err) {
    return next(err);
  }
};

const resendVerificationCode = async (req, res, next) => {
  const languageKey = req.get("Accept-Language")?.split("-")[0] || "sr";
  const type = languages[languageKey];
  const { token } = req.body;
  const now = new Date();

  try {
    // find the code by invitation token
    const invitation = await db.findInvitationByToken(token);
    if (!invitation) {
      // if the invitation by token was not found
      const error = new Error("authorization_err");
      error.status = 401;
      return next(error);
    }

    // check if the invitation has expired
    if (invitation.expiresAt < now) {
      const error = new Error("authorization_err");
      error.status = 401;
      return next(error);
    }
    const randomCode = crypto.randomInt(100000, 999999 + 1);
    await db.createInvitationCode(
      token,
      Number(randomCode),
      addMinutes(new Date(), 5)
    );
    // resend new verification code by email
    const emailSent = await sendVerificationCode(invitation.email, randomCode);

    if (!emailSent) {
      console.error(
        "Code has been successfully generated but email was not sent"
      );
    }

    return res.status(200).json({
      success: true,
      message: type.success_invitation_verification_code_resend,
      invitationToken: token,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  generateInvitation,
  validateInvitation,
  verifyInvitationCode,
  resendVerificationCode,
};
