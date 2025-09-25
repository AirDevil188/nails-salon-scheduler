const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

const verifyHash = async (value, hashedValue) => {
  return await bcrypt.compare(value, hashedValue);
};

const signToken = async (credentials) => {
  const payload = {
    id: credentials.id,
    email: credentials.email,
    role: credentials.role,
    first_name: credentials.first_name,
    last_name: credentials.last_name,
  };
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
};

const signRefreshToken = async (credentials) => {
  const payload = {
    id: credentials.id,
    email: credentials.email,
  };

  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1w",
  });
};

const decodeToken = (token) => {
  return jsonwebtoken.decode(token);
};

module.exports = { verifyHash, signToken, signRefreshToken, decodeToken };
