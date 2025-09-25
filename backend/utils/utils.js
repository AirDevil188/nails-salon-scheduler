const bcrypt = require("bcrypt");
const crypto = require("crypto");
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

const generateRefreshToken = () => {
  try {
    const buffer = crypto.randomBytes(48);
    // Convert the buffer to a Base64 URL-safe string
    return buffer.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
  } catch (err) {
    console.error(err);
    return null;
  }
};

const decodeToken = (token) => {
  return jsonwebtoken.decode(token);
};

module.exports = {
  verifyHash,
  signToken,
  signRefreshToken,
  decodeToken,
  generateRefreshToken,
};
