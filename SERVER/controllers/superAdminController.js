const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");
const SuperAdminProfile = require("../models/SuperAdminProfile");
const TPOProfile = require("../models/TPOProfile");
const { generateActivationToken } = require("../utils/cryptoUtils");
const NotificationLog = require("../models/NotificationLog");

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

// Create TPO
exports.createTPO = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, name, phone } = req.body;

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const { rawToken, tokenHash, tokenExpires } = generateActivationToken();

    const newUser = new User({
      email,
      password: "defaultPassword", 
      role: "TPO",
      isApproved: true,
      status: "PENDING",
      activationTokenHash: tokenHash,
      activationTokenExpires: tokenExpires,
    });
    const savedUser = await newUser.save({ session });

    const newProfile = new TPOProfile({
      userId: savedUser._id,
      name,
      phone,
      createdBy: req.user.id,
    });
    await newProfile.save({ session });

    // notification for setup email
    const setupLink = `${process.env.CLIENT_URL}/setup-password?token=${rawToken}&id=${savedUser._id}`;

    await NotificationLog.create([{
      recipientEmail: email,
      subject: "Welcome to CampusBridge - Setup your TPO Account",
      content: `Hello ${name},\n\nYou have been invited as a Training and Placement Officer on CampusBridge.\nPlease click the link below to set up your password:\n\n${setupLink}\n\nThis link will expire in 24 hours.`,
      type: "WELCOME",
      status: "PENDING",
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "TPO created successfully and setup email sent." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create TPO Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All TPOs
exports.getAllTPOs = async (req, res) => {
  try {
    const users = await User.find({ role: "TPO" }).select("email status isApproved");
    const userIds = users.map(u => u._id);

    const profiles = await TPOProfile.find({ userId: { $in: userIds } }).populate("createdBy", "email");

    const tpos = profiles.map(profile => {
      const user = users.find(u => u._id.toString() === profile.userId.toString());
      return {
        id: user._id,
        email: user.email,
        status: user.status,
        name: profile.name,
        phone: profile.phone,
        createdBy: profile.createdBy ? profile.createdBy.email : "Unknown",
        createdAt: profile.createdAt
      };
    });

    res.status(200).json({ message: "TPOs fetched successfully", data: tpos });
  } catch (error) {
    console.error("Get All TPOs Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get TPO By Id
exports.getTPOById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -activationToken -activationTokenExpires");
    if (!user || user.role !== "TPO") {
      return res.status(404).json({ message: "TPO not found" });
    }

    const profile = await TPOProfile.findOne({ userId: user._id }).populate("createdBy", "email");

    res.status(200).json({
      message: "TPO fetched successfully",
      data: {
        id: user._id,
        email: user.email,
        status: user.status,
        name: profile?.name,
        phone: profile?.phone,
        createdBy: profile?.createdBy?.email || "Unknown",
        createdAt: profile?.createdAt,
        updatedAt: profile?.updatedAt
      }
    });
  } catch (error) {
    console.error("Get TPO By Id Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update TPO
exports.updateTPO = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const profile = await TPOProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: "TPO profile not found" });

    if (name) profile.name = name;
    if (phone) profile.phone = phone;

    await profile.save();
    res.status(200).json({ message: "TPO updated successfully" });
  } catch (error) {
    console.error("Update TPO Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Toggle TPO Status (Soft delete / Reactivate)
exports.toggleTPOStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "TPO") {
      return res.status(404).json({ message: "TPO not found" });
    }

    if (user.status === "PENDING") {
      return res.status(400).json({ message: "Cannot toggle status of a PENDING TPO. They must set their password first." });
    }

    user.status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await user.save();

    res.status(200).json({ message: `TPO successfully marked as ${user.status}` });
  } catch (error) {
    console.error("Toggle TPO Status Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
