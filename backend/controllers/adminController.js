const db = require("@db/query");

const getInvitations = async (req, res, next) => {
  try {
    const {
      status,
      limit: limitString = "25",
      page: pageString = "1",
      orderBy,
    } = req.query;

    const safeLimit = parseInt(limitString, 10) || 25;
    const safePage = parseInt(pageString, 10) || 1;

    // find all invitations in the db
    const { invitations, totalCount } = await db.adminGetAllInvitations({
      status,
      limit: safeLimit,
      page: safePage,
      orderBy,
    });

    return res.status(200).json({
      invitations: invitations, // The slice of data
      limit: safeLimit,
      page: safePage,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const deleteInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    await db.adminDeleteInvitation(invitationId);
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { limit = 25, page = 1 } = req.query;
    const { id } = req.user;

    // find all users in the db
    const allUsers = await db.adminGetAllUsers(id, {
      limit: parseInt(limit),
      page: parseInt(page),
    });

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

const getAppointments = async (req, res, next) => {
  // set default if not provided to req query
  try {
    const { status, limit = 25, page = 1 } = req.query;

    const appointments = await db.adminGetAllAppointments({
      status,
      limit: parseInt(limit),
      page: parseInt(page),
    });
    return res.status(200).json({
      appointments: appointments,
    });
  } catch (err) {
    return next(err);
  }
};
// TODO:
// admins can create new appointments
// admins can update their appointments
// admins can cancel appointments

module.exports = {
  getInvitations,
  deleteInvitation,
  getUsers,
  deleteUser,
  getAppointments,
};
