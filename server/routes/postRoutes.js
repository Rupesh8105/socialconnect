const express = require("express");

const router = express.Router();

const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  deletePost
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

// Create Post
router.post("/", protect, createPost);

// Get All Posts
router.get("/", getPosts);

// Like / Unlike Post
router.put("/:id/like", protect, toggleLike);

// Add Comment
router.post("/:id/comment", protect, addComment);

// Delete Post
router.delete("/:id", protect, deletePost);

module.exports = router;