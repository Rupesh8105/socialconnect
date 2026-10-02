const express = require("express");

const router = express.Router();

const {
  followUser,
  unfollowUser,
  getUserProfile,
  updateProfile,
  searchUsers
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
router.get("/search", protect, searchUsers);
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);
router.put("/profile", protect, updateProfile);
router.get("/:id", getUserProfile);


module.exports = router;