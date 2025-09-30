const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const { addWeeks } = require("date-fns");
const { Resend } = require("resend");
const { validator } = require("validator");

const verifyHash = async (value, hashedValue) => {
  return await bcrypt.compare(value, hashedValue);
};

const signToken = (credentials, expiresIn) => {
  const payload = {
    id: credentials.id,
    role: credentials.role,
  };
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresIn,
  });
};

const verifyToken = (token) => {
  return jsonwebtoken.verify(token, process.env.JWT_SECRET);
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

const oneWeekFromNow = () => {
  const now = new Date();
  return addWeeks(now, 1);
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
  oneWeekFromNow,
  sendVerificationCode,
  isUUID,
};
