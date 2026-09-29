const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Social Media Platform API is running 🚀"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});