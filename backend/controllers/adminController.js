const db = require("@db/query");

// TODO:
// admins can get all sent invitations and they can view  their status
// admins can revoke invitations

// TODO:
// admins can view all of the users
// admins can delete the users from the app

const getUsers = async (req, res, next) => {
  const { id } = req.user;

  try {
    // find all users in the db
    const allUsers = await db.adminGetAllUsers(id);

    return res.status(200).json({
      users: allUsers,
    });
  } catch (err) {
    return next(err);
  }
};

// TODO:
// admins can view their appointments
// admins can create new appointments
// admins can update their appointments
// admins can cancel appointments

module.exports = {
  getUsers,
};
