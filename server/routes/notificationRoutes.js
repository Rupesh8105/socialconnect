const express = require("express");

const router = express.Router();

const Notification = require("../models/Notification");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId
    })
      .populate("sender", "name username profilePicture")
      .populate("post", "content")
      .sort({ createdAt: -1 });

    res.status(200).json({
      notifications
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;