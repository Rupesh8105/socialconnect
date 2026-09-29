const Post = require("../models/Post");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Post content is required"
      });
    }

    const post = await Post.create({
      user: req.user.userId,
      content: content.trim()
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user", "name username");

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name username")
      .populate("comments.user", "name username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);

  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// LIKE / UNLIKE POST
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const userId = req.user.userId;

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "name username")
      .populate("comments.user", "name username");

    res.status(200).json({
      message: alreadyLiked
        ? "Post unliked"
        : "Post liked",
      post: updatedPost
    });

  } catch (error) {
    console.error("LIKE ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "Comment cannot be empty"
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    post.comments.push({
      user: req.user.userId,
      text: text.trim()
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "name username")
      .populate("comments.user", "name username");

    res.status(201).json({
      message: "Comment added successfully",
      post: updatedPost
    });

  } catch (error) {
    console.error("COMMENT ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
// EDIT POST
const editPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Post content is required"
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    // Only post owner can edit
    if (post.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "You can edit only your own post"
      });
    }

    post.content = content.trim();

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "name username")
      .populate("comments.user", "name username");

    res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost
    });

  } catch (error) {
    console.error("EDIT POST ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        message: "You can delete only your own post"
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("DELETE POST ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
// EXPORTS
module.exports = {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  editPost,
  deletePost
};
