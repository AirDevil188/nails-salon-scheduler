const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const { Resend } = require("resend");
const validator = require("validator");

const verifyHash = async (value, hashedValue) => {
  return await bcrypt.compare(value, hashedValue);
};

const signToken = (credentials, expiresIn, type) => {
  try {
    if (type === "access") {
      const payload = {
        id: credentials.id,
        role: credentials.role,
      };
      return jsonwebtoken.sign(payload, process.env.ACCESS_SECRET, {
        algorithm: "HS256",
        expiresIn: expiresIn,
      });
    } else if (type === "refresh") {
      const payload = {
        id: credentials.id,
        userId: credentials.userId,
      };
      return jsonwebtoken.sign(payload, process.env.REFRESH_SECRET, {
        algorithm: "HS256",
        expiresIn: expiresIn,
      });
    } else if (type === "invitation") {
      const payload = {
        id: credentials.id,
        email: credentials.email,
        jti: credentials.jti,
      };
      return jsonwebtoken.sign(payload, process.env.INVITATION_SECRET, {
        algorithm: "HS256",
        expiresIn: expiresIn,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

const verifyToken = (token, secret) => {
  if (secret === "access") {
    return jsonwebtoken.verify(token, process.env.ACCESS_SECRET);
  } else if (secret === "refresh") {
    return jsonwebtoken.verify(token, process.env.REFRESH_SECRET);
  } else if (secret === "invitation") {
    return jsonwebtoken.verify(token, process.env.INVITATION_SECRET);
  }
};

const createHashedPassword = async (value) => {
  try {
    const hashedPassword = await bcrypt.hash(value, 12);
    return hashedPassword;
  } catch (err) {
    console.error(err);
    throw err;
  }
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

const sendVerificationCode = async (email, code) => {
  const resend = new Resend(process.env.EMAIL_API_KEY);

  resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verification Code",
    html: `<p>This your code <strong>${code}</strong>!</p>`,
  });
};

const isUUID = (string) => {
  // check if the provided userId is UUID of version 4 - because prisma is using the fourth version

  return typeof string === "string" && validator.isUUID(string, 4);
};

module.exports = {
  verifyHash,
  signToken,
  verifyToken,
  decodeToken,
  generateRefreshToken,
  createHashedPassword,
  sendVerificationCode,
  isUUID,
};
