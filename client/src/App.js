import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);

  const [commentText, setCommentText] = useState({});
  const [, setCommentingPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showConnections, setShowConnections] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState([]);

const [profileForm, setProfileForm] = useState({
  name: "",
  bio: "",
  profilePicture: ""
});
    
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });

  // CHECK LOGIN AFTER PAGE REFRESH
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // FETCH POSTS AFTER LOGIN
  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn]);

  // FORM CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! 🎉");

        setFormData({
          name: "",
          username: "",
          email: "",
          password: ""
        });

        setIsLogin(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server se connection nahi ho pa raha.");
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setUser(data.user);
        setIsLoggedIn(true);

        setFormData({
          name: "",
          username: "",
          email: "",
          password: ""
        });

        alert("Login successful! 🎉");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server se connection nahi ho pa raha.");
    }
  };

  // GET ALL POSTS
  const fetchPosts = async () => {
    setLoadingPosts(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/posts"
      );

      const data = await response.json();

      if (response.ok) {
        setPosts(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Fetch posts error:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // CREATE POST
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!postContent.trim()) {
      alert("Please write something first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      return;
    }

    setCreatingPost(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content: postContent
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPosts((previousPosts) => [
          data.post,
          ...previousPosts
        ]);

        setPostContent("");

        alert("Post created successfully! 🎉");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Create post error:", error);
      alert("Post create nahi ho pa raha.");
    } finally {
      setCreatingPost(false);
    }
  };

  // LIKE / UNLIKE POST
const handleLike = async (postId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login again.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/posts/${postId}/like`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (response.ok) {
      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post._id === postId
            ? data.post
            : post
        )
      );
    } else {
      alert(data.message);
    }

  } catch (error) {
    console.error("Like error:", error);
    alert("Like nahi ho pa raha.");
  }
};
// ADD COMMENT
const handleComment = async (postId) => {
  const text = commentText[postId];

  if (!text || !text.trim()) {
    alert("Please write a comment.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login again.");
    return;
  }

  setCommentingPost(postId);

  try {
    const response = await fetch(
      `http://localhost:5000/api/posts/${postId}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: text
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post._id === postId
            ? data.post
            : post
        )
      );

      setCommentText((previous) => ({
        ...previous,
        [postId]: ""
      }));
    } else {
      alert(data.message);
    }

  } catch (error) {
    console.error("Comment error:", error);
    alert("Comment add nahi ho pa raha.");
  } finally {
    setCommentingPost(null);
  }
};
// DELETE POST
const handleDelete = async (postId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this post?"
  );

  if (!confirmDelete) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/posts/${postId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (response.ok) {
      setPosts((previousPosts) =>
        previousPosts.filter(
          (post) => post._id !== postId
        )
      );

      alert("Post deleted successfully! 🗑️");
    } else {
      alert(data.message);
    }

  } catch (error) {
    console.error("Delete error:", error);
    alert("Post delete nahi ho pa raha.");
  }
};
const handleEdit = async (postId) => {
  if (!editContent.trim()) {
    alert("Post cannot be empty");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/posts/${postId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editContent
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update post");
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? data.post : post
      )
    );

    setEditingPost(null);
    setEditContent("");

  } catch (error) {
    console.error("EDIT POST ERROR:", error);
    alert("Something went wrong");
  }
};

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setPosts([]);
    setPostContent("");
    setIsLoggedIn(false);
  };
const handleProfile = async (userId) => {
  if (!userId) {
    console.log("USER OBJECT:", user);
    alert("User ID not found. Please login again.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/users/${userId}`
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to load profile");
      return;
    }
setIsFollowing(
  data.user.followers?.some(
    (follower) => follower._id === user?._id || follower._id === user?.id
  )
);
    setShowConnections(null);
    setProfileUser(data.user);

if (
  data.user._id === user?._id ||
  data.user._id === user?.id
) {
  setProfileForm({
    name: data.user.name || "",
    bio: data.user.bio || "",
    profilePicture: data.user.profilePicture || ""
  });
}

setShowProfile(true);
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    alert("Something went wrong");
  }
};
const handleSearch = async (e) => {
  const value = e.target.value;

  setSearchQuery(value);

  if (!value.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/users/search?query=${encodeURIComponent(value)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data.message);
      return;
    }

    setSearchResults(data.users);
  } catch (error) {
    console.error("SEARCH ERROR:", error);
  }
};
const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/notifications",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data.message);
      return;
    }

    setNotifications(data.notifications);
  } catch (error) {
    console.error("NOTIFICATION ERROR:", error);
  }
};
const handleFollow = async () => {
  try {
    const targetUserId = profileUser._id;

    const response = await fetch(
      `http://localhost:5000/api/users/${targetUserId}/${
        isFollowing ? "unfollow" : "follow"
      }`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Something went wrong");
      return;
    }

    setIsFollowing(!isFollowing);

    setProfileUser((prev) => ({
      ...prev,
      followers: isFollowing
        ? prev.followers.filter(
            (follower) => follower._id !== user?._id && follower._id !== user?.id
          )
        : [...(prev.followers || []), { _id: user?._id || user?.id }],
    }));
  } catch (error) {
    console.error("FOLLOW ERROR:", error);
    alert("Something went wrong");
  }
};
const handleUpdateProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/users/profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Profile update failed");
      return;
    }
    
    setProfileUser(data.user);
    setUser(data.user);

    localStorage.setItem("user", JSON.stringify(data.user));

    setEditingProfile(false);

    alert("Profile updated successfully! 🎉");
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    alert("Something went wrong");
  }
};
  // HOME PAGE
  if (isLoggedIn) {

  if (showProfile && profileUser) {
    return (
      <div className="home-page">
        <nav className="navbar">
          <div className="logo">
            SocialConnect
          </div>

          <button
            className="refresh-btn"
            onClick={() => setShowProfile(false)}
          >
            ← Back
          </button>
        </nav>

        <main className="main-content">
          <div className="profile-card">
            <div className="avatar">
  {profileUser.profilePicture ? (
    <img
      src={profileUser.profilePicture}
      alt="Profile"
    />
  ) : (
    profileUser.name?.charAt(0).toUpperCase()
  )}
</div>
            <h2>{profileUser.name}</h2>

            <p>@{profileUser.username}</p>

            <p>
              {profileUser.bio || "No bio yet."}
            </p>

           <div className="profile-stats">

  <div
    onClick={() => setShowConnections("followers")}
    style={{ cursor: "pointer" }}
  >
    <strong>{profileUser.followers?.length || 0}</strong>
    <span>Followers</span>
  </div>

  <div
    onClick={() => setShowConnections("following")}
    style={{ cursor: "pointer" }}
  >
    <strong>{profileUser.following?.length || 0}</strong>
    <span>Following</span>
  </div>

</div>
{showConnections && (
  <div className="connections-list">

    <h3>
      {showConnections === "followers"
        ? "Followers"
        : "Following"}
    </h3>

    {(showConnections === "followers"
      ? profileUser.followers
      : profileUser.following
    )?.length === 0 ? (
      <p>No users yet.</p>
    ) : (
      (showConnections === "followers"
        ? profileUser.followers
        : profileUser.following
      )?.map((connection) => (
        <div
          key={connection._id}
          className="connection-user"
          onClick={() => {
            setShowConnections(null);
            handleProfile(connection._id);
          }}
        >
          <strong>{connection.name}</strong>
          <span>@{connection.username}</span>
        </div>
      ))
    )}

  </div>
)}
                      {(profileUser._id !== user?._id &&
  profileUser._id !== user?.id) && (
  <button
    className="follow-btn"
    onClick={handleFollow}
  >
    {isFollowing ? "Unfollow" : "Follow"}
  </button>
)}
{(profileUser._id === user?._id ||
  profileUser._id === user?.id) && (
  <button
    className="edit-profile-btn"
    onClick={() => setEditingProfile(true)}
  >
    ✏️ Edit Profile
  </button>
)}

{editingProfile && (
  <div className="edit-profile-form">

    <input
      type="text"
      placeholder="Name"
      value={profileForm.name}
      onChange={(e) =>
        setProfileForm({
          ...profileForm,
          name: e.target.value
        })
      }
    />

    <textarea
      placeholder="Bio"
      value={profileForm.bio}
      onChange={(e) =>
        setProfileForm({
          ...profileForm,
          bio: e.target.value
        })
      }
    />

    <input
      type="text"
      placeholder="Profile Picture URL"
      value={profileForm.profilePicture}
      onChange={(e) =>
        setProfileForm({
          ...profileForm,
          profilePicture: e.target.value
        })
      }
    />

    <button
      onClick={handleUpdateProfile}
    >
      💾 Save Changes
    </button>

    <button
      onClick={() => setEditingProfile(false)}
    >
      Cancel
    </button>

  </div>
)}
          </div>
        </main>
      </div>
    );
  }

  return (
      <div className="home-page">
    

        {/* NAVBAR */}
        <nav className="navbar">

          <div className="logo">
            SocialConnect
          </div>
<div className="search-container">
  <input
    type="text"
    placeholder="Search users..."
    value={searchQuery}
    onChange={handleSearch}
  />
  {searchResults.length > 0 && (
  <div className="search-results">

    {searchResults.map((searchUser) => (
      <div
        key={searchUser._id}
        className="search-result-user"
        onClick={() => {
          setSearchResults([]);
          setSearchQuery("");
          handleProfile(searchUser._id);
        }}
      >
        <div className="search-user-info">
          <strong>{searchUser.name}</strong>
          <span>@{searchUser.username}</span>
        </div>
      </div>
    ))}

  </div>
)}
</div>
          <div className="nav-right">

            <button
              className="nav-profile-btn"
              onClick={() => handleProfile(user?._id || user?.id)}
>
  @{user?.username}
</button>
           <button
              className="notification-btn"
              onClick={() => {
                fetchNotifications();
                setShowNotifications((prev) => !prev);
  }}
>
  🔔
</button>
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
        
          </div>

        </nav>
  
{showNotifications && (
  <div className="notification-panel">

    <div className="notification-header">
      <h3>Notifications</h3>

      <button
        onClick={() => setShowNotifications(false)}
      >
        ✕
      </button>
    </div>

    {notifications.length === 0 ? (
      <p className="no-notifications">
        No notifications yet.
      </p>
    ) : (
      notifications.map((notification) => (
        <div
  key={notification._id}
  className={`notification-item ${
    notification.isRead ? "" : "unread"
  }`}
  onClick={() => {
    setShowNotifications(false);
    handleProfile(notification.sender?._id);
  }}
>
          <strong>
            {notification.sender?.name}
          </strong>

          <span>
            started following you.
          </span>
        </div>
      ))
    )}

  </div>
)}

        {/* MAIN CONTENT */}
        <main className="main-content">

          {/* WELCOME */}
          <section className="welcome-section">

            <h1>
              Welcome, {user?.name}! 👋
            </h1>

            <p>
              Share your thoughts with the SocialConnect community.
            </p>

          </section>

          {/* CREATE POST */}
          <section className="create-post-card">

            <div className="post-user">

              <div className="avatar">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user?.name}
                </strong>

                <span>
                  @{user?.username}
                </span>
              </div>

            </div>

            <form onSubmit={handleCreatePost}>

              <textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) =>
                  setPostContent(e.target.value)
                }
                maxLength="500"
              />

              <div className="post-action">

                <span>
                  {postContent.length}/500
                </span>

                <button
                  type="submit"
                  className="post-btn"
                  disabled={creatingPost}
                >
                  {creatingPost
                    ? "Posting..."
                    : "Create Post"}
                </button>

              </div>

            </form>

          </section>

          {/* POSTS FEED */}
          <section className="feed-section">

            <div className="feed-header">

              <h2>
                Latest Posts
              </h2>

              <button
                className="refresh-btn"
                onClick={fetchPosts}
              >
                🔄 Refresh
              </button>

            </div>

            {loadingPosts ? (

              <div className="empty-message">
                Loading posts...
              </div>

            ) : posts.length === 0 ? (

              <div className="empty-message">

                <h3>
                  No posts yet 📝
                </h3>

                <p>
                  Be the first person to share something!
                </p>

              </div>

            ) : (

              <div className="posts-list">

                {posts.map((post) => (

                  <article
                    className="post-card"
                    key={post._id}
                  >

                    <div className="post-header">

                      <div className="post-user">

                        <div className="avatar">
                          {post.user?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div
  className="post-user-info"
  onClick={() => handleProfile(post.user?._id)}
>
  <strong>
    {post.user?.name}
  </strong>

  <span>
    @{post.user?.username}
  </span>
</div>

                      </div>

                      <span className="post-date">
                        {new Date(
                          post.createdAt
                        ).toLocaleString()}
                      </span>

                    </div>

                   {editingPost === post._id ? (
  <>
    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
    />

    <div className="edit-actions">
      <button onClick={() => handleEdit(post._id)}>
        💾 Save
      </button>

      <button
        onClick={() => {
          setEditingPost(null);
          setEditContent("");
        }}
      >
        Cancel
      </button>
    </div>
  </>
) : (
  <p className="post-content">
    {post.content}
  </p>
)}

                    <div className="post-actions">

  <button
    onClick={() => handleLike(post._id)}
  >
    ❤️ {post.likes?.length || 0} Like
  </button>

  <button>
    💬 {post.comments?.length || 0} Comments
  </button>
  {post.user?.username === user?.username && (
  <>
    <button
      onClick={() => {
        setEditingPost(post._id);
        setEditContent(post.content);
      }}
    >
      ✏️ Edit
    </button>

    <button onClick={() => handleDelete(post._id)}>
      🗑️ Delete
    </button>
  </>
)}

</div>

<div className="comments-section">

  {post.comments?.map((comment) => (
    <div className="comment" key={comment._id}>

      <strong>
        {comment.user?.name}
      </strong>

      <p>{comment.text}</p>

    </div>
  ))}

  <div className="comment-input-row">

    <input
      type="text"
      placeholder="Write a comment..."
      value={commentText[post._id] || ""}
      onChange={(e) =>
        setCommentText({
          ...commentText,
          [post._id]: e.target.value
        })
      }
    />

    <button
      onClick={() => handleComment(post._id)}
    >
      Post
    </button>

  </div>
       
</div>

                  </article>

                ))}

              </div>

            )}

          </section>

        </main>

      </div>
    );
  }

  // LOGIN / REGISTER PAGE
  return (
    <div className="app">

      <div className="auth-container">

        <div className="logo">
          SocialConnect
        </div>

        <h2>
          {isLogin
            ? "Welcome Back!"
            : "Create Account"}
        </h2>

        <p className="subtitle">
          {isLogin
            ? "Login to continue to SocialConnect"
            : "Join our social community today"}
        </p>

        <form
          onSubmit={
            isLogin
              ? handleLogin
              : handleRegister
          }
        >

          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="primary-btn"
          >
            {isLogin
              ? "Login"
              : "Create Account"}
          </button>

        </form>

        <p className="switch-text">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <span
            onClick={() => {

              setIsLogin(!isLogin);

              setFormData({
                name: "",
                username: "",
                email: "",
                password: ""
              });

            }}
          >
            {isLogin
              ? " Register"
              : " Login"}
          </span>

        </p>

      </div>

    </div>
  );
}

export default App;