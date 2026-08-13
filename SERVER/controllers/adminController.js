const User = require("../models/User");
const Company = require("../models/Company");
const { generateActivationToken } = require("../utils/cryptoUtils");

// Approve HRs and send email (SUPERADMIN, TPO)
exports.approveHR = async (req, res) => {
  try {
    const hrId = req.params.id;
    const adminId = req.user.id;

    const hrUser = await User.findById(hrId);
    if (!hrUser || hrUser.role !== "HR") {
      return res.status(404).json({ message: "HR not found." });
    }
    if (hrUser.isApproved) {
      return res.status(400).json({ message: "HR is already approved." });
    }

    const { rawToken, tokenHash, tokenExpires } = generateActivationToken();

    hrUser.isApproved = true;
    hrUser.activationTokenHash = tokenHash;
    hrUser.activationTokenExpires = tokenExpires;
    await hrUser.save();
    
    const HRProfile = require("../models/HRProfile");
    const hrProfile = await HRProfile.findOne({ userId: hrId });
    if (hrProfile) {
      await Company.findOneAndUpdate(
        { name: hrProfile.companyName },
        { isApproved: true }
      );
    }

    const activationLink = `${process.env.CLIENT_URL}/setup-password?token=${rawToken}&id=${hrUser._id}`;
    
    const { sendMail } = require("../utils/emailUtils");
    const approveHtml = `
      <h2>Welcome to CampusBridge!</h2>
      <p>Your HR Account has been approved.</p>
      <p>Please click the link below to set up your password and activate your account:</p>
      <a href="${activationLink}" style="display:inline-block; padding:10px 20px; background-color:#00ED64; color:#0A192F; text-decoration:none; border-radius:5px; font-weight:bold;">Activate Account</a>
      <p>This link will expire in 24 hours.</p>
    `;
    await sendMail(hrUser.email, "Your CampusBridge HR Account is Approved!", approveHtml);

    res.status(200).json({
      message: "HR successfully approved. Setup email dispatched.",
      activationLink: activationLink,
    });
  } catch (error) {
    console.error("Approve HR Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Reject HR and notify them (SUPERADMIN / TPO)
exports.rejectHR = async (req, res) => {
  try {
    const hrId = req.params.id;
    const { reason } = req.body; 

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required." });
    }

    const hrUser = await User.findById(hrId);
    if (!hrUser || hrUser.role !== "HR") {
      return res.status(404).json({ message: "HR not found." });
    }

    if (hrUser.isApproved) {
      return res.status(400).json({ message: "Cannot reject an HR that is already approved." });
    }

    const { sendMail } = require("../utils/emailUtils");
    const rejectHtml = `
      <h2>CampusBridge Registration Update</h2>
      <p>Unfortunately, your registration to join CampusBridge as a Corporate Partner was not approved by the placement cell.</p>
      <h3>Reason:</h3>
      <p style="background: #f4f4f4; padding: 10px; border-left: 4px solid #ef4444;">${reason}</p>
      <p>If you believe this was a mistake, please correct the issues and re-register.</p>
    `;
    await sendMail(hrUser.email, "Update on your CampusBridge Registration", rejectHtml);

    // Delete the HR records
    const HRProfile = require("../models/HRProfile");
    await HRProfile.findOneAndDelete({ userId: hrId });
    await User.findByIdAndDelete(hrId);

    res.status(200).json({ message: "HR has been rejected and deleted from the system." });
  } catch (error) {
    console.error("Reject HR Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
