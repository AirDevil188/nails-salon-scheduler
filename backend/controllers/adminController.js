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
      invitations: invitations,
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
    const {
      limit: limitString = "25",
      page: pageString = "1",
      orderBy,
    } = req.query;
    const { id } = req.user;

    const safeLimit = parseInt(limitString, 10) || 25;
    const safePage = parseInt(pageString, 10) || 1;

    // find all users in the db
    const { users, totalCount } = await db.adminGetAllUsers(id, {
      limit: safeLimit,
      page: safePage,
      orderBy,
    });

    return res.status(200).json({
      users: users,
      limit: safeLimit,
      page: safePage,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
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
    const { status, limit = "25", page = "1", orderBy, timeScope } = req.query;

    const safeLimit = parseInt(limit, 10) || 25;
    const safePage = parseInt(page, 10) || 1;

    const { appointments, totalCount } = await db.adminGetAllAppointments({
      status,
      limit: safeLimit,
      page: safePage,
      orderBy,
      timeScope,
    });

    return res.status(200).json({
      appointments: appointments,
      limit: safeLimit,
      page: safePage,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / safeLimit),
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
