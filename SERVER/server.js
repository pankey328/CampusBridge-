require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express();

const url = process.env.MONGO_URI;
const clientUrl = process.env.CLIENT_URL;
const port = process.env.PORT;

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

mongoose
  .connect(url)
  .then(() => console.log(`DATABASE Connected`))
  .catch((error) => console.log(`Database Error:`, error));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
