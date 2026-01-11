// Load environment variables FIRST
require("dotenv").config();

// Verify critical environment variables
console.log("🔧 Environment Check:");
console.log("   PORT:", process.env.PORT || "5000");
console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ MISSING");
console.log("   JWT_EXPIRE:", process.env.JWT_EXPIRE || "7d");
console.log(
  "   FRONTEND_URL:",
  process.env.FRONTEND_URL || "http://localhost:4200"
);

if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET is not set in .env file!");
  console.error("❌ Please create a .env file with JWT_SECRET");
  process.exit(1);
}

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("🚀 ================================");
  console.log("🚀 Server running on http://localhost:" + PORT);
  console.log("🚀 ================================");
  console.log("");
});
