const bcrypt = require("bcrypt");
const User = require("../models/User");
const SuperAdminProfile = require("../models/SuperAdminProfile");

// Create a SuperAdmin
exports.seedSuperAdmin = async (req, res) => {
  try {
    const { email, password, name, phone, secretKey } = req.body;

    if (secretKey !== process.env.SUPERADMIN_SECRET) {
      return res.status(403).json({ message: "Forbidden: Invalid Secret Key" });
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = new User({
      email,
      password: hashedPassword,
      role: "SUPERADMIN",
      isApproved: true,
      status: "ACTIVE",
    });
    const savedUser = await newUser.save();

    // Create SuperAdmin
    const newProfile = new SuperAdminProfile({
      userId: savedUser._id,
      name,
      phone,
      designation: "College Director",
    });
    await newProfile.save();

    res.status(201).json({
      message: "SuperAdmin successfully created!",
      user: {
        id: savedUser._id,
        email: savedUser.email,
        name: newProfile.name,
      },
    });
  } catch (error) {
    console.error("Error seeding SuperAdmin:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
