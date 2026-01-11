const { verifyToken } = require("../utils/jwt.utils");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    console.log(
      "🔐 Auth Middleware - Authorization header:",
      authHeader ? "EXISTS" : "MISSING"
    );

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Access denied.",
      });
    }

    // Check if it starts with Bearer
    if (!authHeader.startsWith("Bearer ")) {
      console.log("❌ Auth Middleware - Invalid format (missing Bearer)");
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Must be: Bearer <token>",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    console.log(
      "🔑 Auth Middleware - Token extracted:",
      token ? token.substring(0, 20) + "..." : "EMPTY"
    );

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Access denied.",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log("❌ Auth Middleware - Token verification failed");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    console.log(
      "✅ Auth Middleware - Token verified for user:",
      decoded.userId
    );

    // Attach user ID to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("💥 Auth Middleware - Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
