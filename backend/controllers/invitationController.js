const db = require("@db/query");
const { generateRefreshToken } = require("@utils/utils");
const { addHours } = require("date-fns/addHours");

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

module.exports = {
  generateInvitation,
};
