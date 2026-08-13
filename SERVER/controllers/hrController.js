const User = require("../models/User");
const HRProfile = require("../models/HRProfile");
const Company = require("../models/Company");

// HR register
exports.registerHR = async (req, res) => {
  try {
    const { email, companyName, designation, phone, linkedinUrl, gstin, website, industry } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    let company = await Company.findOne({ name: companyName });
    if (!company) {
      // Create Company
      company = new Company({
        name: companyName,
        website,
        industry,
        gstin,
        isApproved: false,
      });
      await company.save();
    }

    // Create User
    const newUser = new User({
      email,
      password: "PENDING_SETUP",
      role: "HR",
      isApproved: false,
      status: "PENDING",
    });
    const savedUser = await newUser.save();

    // Create HR Profile
    const newProfile = new HRProfile({
      userId: savedUser._id,
      companyName: company.name,
      designation,
      phone,
      linkedinUrl,
    });
    await newProfile.save();

    res.status(201).json({
      message: "Registration successful! Please wait for TPO approval.",
    });
  } catch (error) {
    console.error("HR Registration Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
