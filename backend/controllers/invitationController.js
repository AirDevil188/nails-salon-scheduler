const db = require("@db/query");
const { generateRefreshToken } = require("@utils/utils");
const { addHours } = require("date-fns/addHours");
const crypto = require("crypto");
const { addMinutes } = require("date-fns/addMinutes");

const generateInvitation = async (req, res, next) => {
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
      message: "Invitation link sent successfully",
      invitationLink: invitation,
    });
  } catch (err) {
    return next(err); // catch unexpected errs and send them to the errHandler
  }
};

const validateInvitation = async (req, res, next) => {
  // get the token from params from URL
  const now = new Date();
  const { token } = req.params;

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

    // if it is found and not expired

    // generate random 6code
    const randomCode = crypto.randomInt(100000, 999999 + 1);
    // create authorization code that will be tied to this token in db
    const updatedInvitation = db.createInvitationCode(
      invitation.token,
      randomCode,
      addMinutes(new Date(), 5)
    );
    return res.status(200).json({
      success: true,
      message: "Invitation Token successfully validated",
      code: updatedInvitation.code,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  generateInvitation,
  validateInvitation,
};
