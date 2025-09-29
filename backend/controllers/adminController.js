const db = require("@db/query");

// TODO:
// admins can get all sent invitations and they can view  their status
// admins can revoke invitations

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

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // delete the user
    await db.adminDeleteUser(userId);
    // return 204 because we don't have any content to return
    return res.status(204).end();
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
  deleteUser,
};
