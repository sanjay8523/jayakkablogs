const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  toggleLike,
} = require("../controllers/blog.controller");

// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// Protected routes - PUT /user/me BEFORE /:id to avoid conflicts
router.get("/user/me", authMiddleware, getMyBlogs);
router.post("/", authMiddleware, createBlog);
router.put("/:id", authMiddleware, updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);
router.post("/:id/like", authMiddleware, toggleLike);

module.exports = router;
