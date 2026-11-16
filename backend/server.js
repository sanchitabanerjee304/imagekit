
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const imageRoutes = require("./routes/image.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Image routes
app.use("/api/images", imageRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to ImageKit Backend!");
});

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ImageKit API is running successfully"
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`ImageKit server running on port ${PORT}`);
    });
};

startServer();
