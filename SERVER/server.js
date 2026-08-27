require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express();

const url = process.env.MONGO_URI || process.env.MONGODB_URI;
const clientUrl = process.env.CLIENT_URL;
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// SuperAdmin Routes
const superAdminRoutes = require("./routes/superAdminRoutes");
app.use("/api/superadmin", superAdminRoutes);

// Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Admin/TPO Routes
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// HR Routes
const hrRoutes = require("./routes/hrRoutes");
app.use("/api/hr", hrRoutes);

// Student Routes
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/student", studentRoutes);

// Interview Routes
const interviewRoutes = require("./routes/interviewRoutes");
app.use("/api/interviews", interviewRoutes);

// File Upload Routes (Cloudinary)
const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

// AI Practice Routes
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

if (!url) {
  console.error("Database Error: MONGO_URI (or MONGODB_URI) is missing from environment variables!");
} else {
  mongoose
    .connect(url)
    .then(() => {
      console.log(`DATABASE Connected`);

      const { startEmailWorker } = require("./workers/emailQueueRunner");
      startEmailWorker();
    })
    .catch((error) => console.log(`Database Error:`, error));
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
