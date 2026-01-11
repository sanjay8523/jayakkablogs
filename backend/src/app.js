const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Use environment variables for flexible configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/auth.routes");
const blogRoutes = require("./routes/blog.routes");

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

module.exports = app;
