// error utils for Socket.IO

const createSocketAuthenticateError = (message, statusCode = 401) => {
  console.error(`Authenticate failed: , ${statusCode} ${message}`);

  // create Error obj
  const error = new Error(message);

  error.data = { status: statusCode, message: message };
  return error;
};

module.exports = {
  createSocketAuthenticateError,
};
