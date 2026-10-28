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
// Mark notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
});
// Get unread notification count
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.userId,
      isRead: false
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("UNREAD COUNT ERROR:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});
module.exports = router;