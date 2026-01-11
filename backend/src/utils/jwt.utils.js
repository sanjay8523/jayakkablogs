const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  console.log("🔑 Generating token for user:", userId);

  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET not found in environment variables!");
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

  console.log("✅ Token generated:", token.substring(0, 20) + "...");

  return token;
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    console.log("🔍 Verifying token:", token.substring(0, 20) + "...");

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not found in environment variables!");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ Token verified for user:", decoded.userId);

    return decoded;
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return null;
  }
};

module.exports = { generateToken, verifyToken };
