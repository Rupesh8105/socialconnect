const User = require("../models/User");
const Notification = require("../models/Notification");
const followUser = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const targetUserId = req.params.id;
if (currentUserId.toString() === targetUserId.toString())
     {
      return res.status(400).json({
        message: "You cannot follow yourself"
      });
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
  return res.status(404).json({
    message: "Current user not found"
  });
}

    if (currentUser.following.some(
  (id) => id.toString() === targetUserId.toString()
)) {
      return res.status(400).json({
        message: "Already following this user"
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

   await currentUser.save();
await targetUser.save();

await Notification.create({
  recipient: targetUserId,
  sender: currentUserId,
  type: "follow"
});

res.status(200).json({
  message: "User followed successfully"
});
  } catch (error) {
    console.error("FOLLOW USER ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const targetUserId = req.params.id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        message: "You cannot unfollow yourself"
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found"
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId.toString()
    );

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: "User unfollowed successfully"
    });
  } catch (error) {
    console.error("UNFOLLOW USER ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    console.log("PROFILE ID:", req.params.id);
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name username")
      .populate("following", "name username");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;
if (
  (name !== undefined && typeof name !== "string") ||
  (bio !== undefined && typeof bio !== "string") ||
  (profilePicture !== undefined &&
    typeof profilePicture !== "string")
) {
  return res.status(400).json({
    message: "Name, bio, and profile picture must be strings"
  });
}
if (name !== undefined && name.trim().length === 0) {
  return res.status(400).json({
    message: "Name cannot be empty"
  });
}

if (name !== undefined && name.trim().length > 50) {
  return res.status(400).json({
    message: "Name cannot exceed 50 characters"
  });
}

if (bio !== undefined && bio.trim().length > 300) {
  return res.status(400).json({
    message: "Bio cannot exceed 300 characters"
  });
}
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following
      }
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (query !== undefined && typeof query !== "string") {
  return res.status(400).json({
    message: "Search query must be a string"
  });
}
if (query && query.length > 100) {
  return res.status(400).json({
    message: "Search query cannot exceed 100 characters"
  });
}

    if (!query || query.trim() === "") {
      return res.status(200).json({
        users: []
      });
    }
const safeQuery = escapeRegex(query.trim());
    const users = await User.find({
      $or: [
        {
          name: {
           $regex: safeQuery,
            $options: "i"
          }
        },
        {
          username: {
            $regex: safeQuery,
            $options: "i"
          }
        }
      ]
    })
      .select("name username profilePicture bio")
      .limit(10);

    res.status(200).json({
      users
    });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
module.exports = {
  followUser,
  unfollowUser,
  getUserProfile,
  updateProfile,
  searchUsers
};