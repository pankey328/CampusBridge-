const mongoose = require("mongoose");
const User = require("../models/User");
const Company = require("../models/Company");
const { generateActivationToken } = require("../utils/cryptoUtils");

// Get All HRs
exports.getAllHRs = async (req, res) => {
  try {
    const { status } = req.query; // PENDING / ACTIVE / INACTIVE

    const query = { role: "HR" };
    if (status === "PENDING") {
      query.isApproved = false;
    } else if (status === "ACTIVE") {
      query.isApproved = true;
      query.status = "ACTIVE";
    } else if (status === "INACTIVE") {
      query.isApproved = true;
      query.status = "INACTIVE";
    }

    const users = await User.find(query).select("email status isApproved");
    const userIds = users.map(u => u._id);

    const HRProfile = require("../models/HRProfile");
    const profiles = await HRProfile.find({ userId: { $in: userIds } });
    
    const companyNames = profiles.map(p => p.companyName);
    const companies = await Company.find({ name: { $in: companyNames } });

    const hrs = profiles.map(profile => {
      const user = users.find(u => u._id.toString() === profile.userId.toString());
      const company = companies.find(c => c.name === profile.companyName);
      return {
        id: user._id,
        email: user.email,
        status: user.status,
        isApproved: user.isApproved,
        companyName: profile.companyName,
        designation: profile.designation,
        phone: profile.phone,
        linkedinUrl: profile.linkedinUrl || "",
        industry: company?.industry || "",
        website: company?.website || "",
        gstin: company?.gstin || "",
        companyId: company?._id || null,
      };
    });

    res
      .status(200)
      .json({ message: "Hr Data fetched successfully", data: hrs });
  } catch (error) {
    console.error("Get All HRs Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get HR By Id
exports.getHRById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -activationTokenHash -resetPasswordOtp");
    if (!user || user.role !== "HR") return res.status(404).json({ message: "HR not found" });

    const HRProfile = require("../models/HRProfile");
    const profile = await HRProfile.findOne({ userId: user._id })
      .populate("createdBy", "email role")
      .populate("updatedBy", "email role");
    
    let company = null;
    if (profile) {
      company = await Company.findOne({ name: profile.companyName });
    }

    const hrData = {
      id: user._id,
      email: user.email,
      status: user.status,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companyName: profile?.companyName,
      designation: profile?.designation,
      phone: profile?.phone,
      linkedinUrl: profile?.linkedinUrl || "",
      industry: company?.industry || "",
      website: company?.website || "",
      gstin: company?.gstin || "",
      createdBy: profile?.createdBy ? { email: profile.createdBy.email, role: profile.createdBy.role } : null,
      updatedBy: profile?.updatedBy ? { email: profile.updatedBy.email, role: profile.updatedBy.role } : null
    };

    res.status(200).json({ message: "HR Data fetched successfully", data: hrData });
  } catch (error) {
    console.error("Get HR By Id Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Approve HRs
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

// Reject HR
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

const csv = require("csvtojson");
const StudentProfile = require("../models/StudentProfile");
const NotificationLog = require("../models/NotificationLog");
const bcrypt = require("bcrypt");
const axios = require("axios");

// Bulk Import (Validation Only)
exports.bulkImportDryRun = async (req, res) => {
  try {
    let jsonArray = [];

    if (req.body.sheetUrl) {
      try {
        const match = req.body.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) return res.status(400).json({ message: "Invalid Google Sheet URL" });
        const sheetId = match[1];
        const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        
        const response = await axios.get(exportUrl);
        jsonArray = await csv().fromString(response.data);
      } catch (error) {
        return res.status(400).json({ message: "Failed to fetch data from Google Sheet. Ensure the link is public." });
      }
    } else if (req.files && req.files.file) {
      const fileBuffer = req.files.file.data;
      jsonArray = await csv().fromString(fileBuffer.toString('utf8'));
    } else if (req.body.students) {
      jsonArray = typeof req.body.students === 'string' ? JSON.parse(req.body.students) : req.body.students;
    } else {
      return res.status(400).json({ message: "No CSV file, JSON data, or Google Sheet URL provided" });
    }

    const validStudents = [];
    const errorStudents = [];
    
    const existingEmails = new Set((await User.find({ role: "STUDENT" }).select("email")).map(u => u.email));
    const existingRolls = new Set((await StudentProfile.find({}).select("rollNumber")).map(p => p.rollNumber));
    
    const uploadEmails = new Set();
    const uploadRolls = new Set();

    jsonArray.forEach((row, index) => {
      const rowNum = index + 2; 
      let isError = false;
      let errMsg = "";

      if (!row.email || !row.firstName || !row.lastName || !row.enrollmentNumber) {
        isError = true;
        errMsg = "Missing required fields (email, firstName, lastName, enrollmentNumber)";
      } else if (existingEmails.has(row.email)) {
        isError = true;
        errMsg = `Email ${row.email} is already registered`;
      } else if (existingRolls.has(row.enrollmentNumber)) {
        isError = true;
        errMsg = `Enrollment Number ${row.enrollmentNumber} is already registered`;
      } else if (uploadEmails.has(row.email)) {
        isError = true;
        errMsg = `Duplicate email within upload: ${row.email}`;
      } else if (uploadRolls.has(row.enrollmentNumber)) {
        isError = true;
        errMsg = `Duplicate enrollment number within upload: ${row.enrollmentNumber}`;
      }

      if (isError) {
        errorStudents.push({ row: rowNum, message: errMsg, data: row });
      } else {
        uploadEmails.add(row.email);
        uploadRolls.add(row.enrollmentNumber);
        validStudents.push(row);
      }
    });

    res.status(200).json({
      totalParsed: jsonArray.length,
      validCount: validStudents.length,
      errorCount: errorStudents.length,
      errors: errorStudents, 
      validStudents: validStudents,
    });
  } catch (error) {
    console.error("Bulk Import Dry Run Error:", error);
    res.status(500).json({ message: "Failed to parse data", error: error.message });
  }
};

// Bulk Import
exports.bulkImportCommit = async (req, res) => {
  try {
    let jsonArray = [];

    if (req.files && req.files.file) {
      const fileBuffer = req.files.file.data;
      jsonArray = await csv().fromString(fileBuffer.toString('utf8'));
    } else if (req.body.students) {
      jsonArray = typeof req.body.students === 'string' ? JSON.parse(req.body.students) : req.body.students;
    } else {
      return res.status(400).json({ message: "No CSV file or JSON data provided" });
    }

    const existingEmails = new Set((await User.find({ role: "STUDENT" }).select("email")).map(u => u.email));
    const existingRolls = new Set((await StudentProfile.find({}).select("rollNumber")).map(p => p.rollNumber));
    
    const uploadEmails = new Set();
    const uploadRolls = new Set();
    const studentsToCreate = [];

    jsonArray.forEach((row, index) => {
      const isEmailClean = row.email && !existingEmails.has(row.email) && !uploadEmails.has(row.email);
      const isRollClean = row.enrollmentNumber && !existingRolls.has(row.enrollmentNumber) && !uploadRolls.has(row.enrollmentNumber);
      
      if (isEmailClean && isRollClean && row.firstName && row.lastName) {
        uploadEmails.add(row.email);
        uploadRolls.add(row.enrollmentNumber);
        studentsToCreate.push(row);
      }
    });

    if (studentsToCreate.length === 0) {
      return res.status(400).json({ message: "No valid new students found to import." });
    }

    if (studentsToCreate.length !== jsonArray.length) {
      return res.status(400).json({ 
        message: "Commit aborted: Some students in the payload are invalid or duplicates. Please Re-Validate the data on the frontend before committing." 
      });
    }

    const createdUsers = [];
    const notificationLogs = [];

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      for (const student of studentsToCreate) {

        const tempPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // Create User
        const newUser = new User({
          email: student.email,
          password: hashedPassword,
          role: "STUDENT",
          isApproved: true,
          mustChangePassword: true,
        });
        await newUser.save({ session });
        createdUsers.push(newUser);

        // Create Student Profile
        const newProfile = new StudentProfile({
          userId: newUser._id,
          firstName: student.firstName,
          lastName: student.lastName,
          rollNumber: student.enrollmentNumber,
          branch: student.department || "",
          passoutYear: student.graduationYear || new Date().getFullYear(),
          createdBy: req.user.id,
        });
        await newProfile.save({ session });

        const emailHtml = `
          <h2>Welcome to CampusBridge!</h2>
          <p>Hello ${student.firstName},</p>
          <p>Your placement cell has created an account for you.</p>
          <p><strong>Your Temporary Password:</strong> <span style="background:#f4f4f4;padding:4px 8px;letter-spacing:1px;">${tempPassword}</span></p>
          <p>Please log in immediately and change your password.</p>
          <a href="${process.env.CLIENT_URL}/login" style="display:inline-block; padding:10px 20px; background-color:#00ED64; color:#0A192F; text-decoration:none; border-radius:5px; font-weight:bold;">Log In Now</a>
        `;

        notificationLogs.push({
          studentId: newUser._id,
          subject: "Welcome to CampusBridge! Set your password",
          type: "WELCOME", 
          content: emailHtml,
          recipientEmail: student.email,
          status: "PENDING",
        });
      }

      if (notificationLogs.length > 0) {
        await NotificationLog.insertMany(notificationLogs, { session });
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: `Successfully imported ${createdUsers.length} students. Welcome emails have been queued.`,
        importedCount: createdUsers.length
      });
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      throw dbError;
    }
  } catch (error) {
    console.error("Bulk Import Commit Error:", error);
    res.status(500).json({ message: "Failed to commit student import", error: error.message });
  }
};

// Add HR Manually
exports.addHRManually = async (req, res) => {
  try {
    const { email, companyName, designation, phone, linkedinUrl, industry, website, gstin } = req.body;

    if (!email || !companyName || !designation || !phone) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const { rawToken, tokenHash, tokenExpires } = generateActivationToken();
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: "HR",
      isApproved: true,
      status: "ACTIVE",
      activationTokenHash: tokenHash,
      activationTokenExpires: tokenExpires,
    });

    await newUser.save();

    const HRProfile = require("../models/HRProfile");
    const newProfile = new HRProfile({
      userId: newUser._id,
      companyName,
      designation,
      phone,
      linkedinUrl,
      createdBy: req.user.id,
    });
    await newProfile.save();

    const existingCompany = await Company.findOne({ name: companyName });
    if (!existingCompany) {
      await Company.create({ 
        name: companyName, 
        isApproved: true,
        industry: industry || "",
        website: website || "",
        gstin: gstin || "",
      });
    } else {
      if (industry) existingCompany.industry = industry;
      if (website) existingCompany.website = website;
      if (gstin) existingCompany.gstin = gstin;
      existingCompany.isApproved = true;
      await existingCompany.save();
    }

    const activationLink = `${process.env.CLIENT_URL}/setup-password?token=${rawToken}&id=${newUser._id}`;
    
    const { sendMail } = require("../utils/emailUtils");
    const approveHtml = `
      <h2>Welcome to CampusBridge!</h2>
      <p>An administrative account has been created for you representing ${companyName}.</p>
      <p>Please click the link below to set up your password and activate your account:</p>
      <a href="${activationLink}" style="display:inline-block; padding:10px 20px; background-color:#00ED64; color:#0A192F; text-decoration:none; border-radius:5px; font-weight:bold;">Activate Account</a>
      <p>This link will expire in 24 hours.</p>
    `;
    await sendMail(newUser.email, "Your CampusBridge HR Account is Ready!", approveHtml);

    res.status(201).json({ message: "HR added successfully and activation email sent." });
  } catch (error) {
    console.error("Add HR Manual Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update HR
exports.updateHR = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, designation, phone, linkedinUrl, email, industry, website, gstin } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== "HR") return res.status(404).json({ message: "HR not found" });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already in use." });
      user.email = email;
      await user.save();
    }

    const HRProfile = require("../models/HRProfile");
    const profile = await HRProfile.findOne({ userId: id });
    if (profile) {
      profile.companyName = companyName || profile.companyName;
      profile.designation = designation || profile.designation;
      profile.phone = phone || profile.phone;
      profile.linkedinUrl = linkedinUrl !== undefined ? linkedinUrl : profile.linkedinUrl;
      profile.updatedBy = req.user.id;
      await profile.save();

      // Company details update
      if (companyName) {
        let existingCompany = await Company.findOne({ name: companyName });
        if (!existingCompany) {
          existingCompany = await Company.create({ 
            name: companyName, 
            isApproved: true,
            industry: industry || "",
            website: website || "",
            gstin: gstin || ""
          });
        } else {
          if (industry) existingCompany.industry = industry;
          if (website) existingCompany.website = website;
          if (gstin) existingCompany.gstin = gstin;
          await existingCompany.save();
        }
      }
    }

    res.status(200).json({ message: "HR updated successfully." });
  } catch (error) {
    console.error("Update HR Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Soft Delete HR
exports.softDeleteHR = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "HR not found" });
    
    user.status = "INACTIVE";
    await user.save();
    
    res.status(200).json({ message: "HR moved to inactive (Soft Deleted)." });
  } catch (error) {
    console.error("Soft Delete HR Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Hard Delete HR
exports.hardDeleteHR = async (req, res) => {
  try {
    const HRProfile = require("../models/HRProfile");
    await HRProfile.findOneAndDelete({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "HR permanently deleted." });
  } catch (error) {
    console.error("Hard Delete HR Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Restore HR
exports.restoreHR = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "HR not found" });
    
    user.status = "ACTIVE";
    await user.save();
    
    res.status(200).json({ message: "HR restored successfully." });
  } catch (error) {
    console.error("Restore HR Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Add Student Manually
exports.addStudentManually = async (req, res) => {
  try {
    const { email, firstName, lastName, rollNumber, branch, passoutYear } = req.body;

    if (!email || !firstName || !lastName || !rollNumber) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists." });

    const existingRoll = await StudentProfile.findOne({ rollNumber });
    if (existingRoll) return res.status(400).json({ message: "Roll number already exists." });

    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: "STUDENT",
      isApproved: true,
      status: "ACTIVE",
      mustChangePassword: true,
    });
    await newUser.save();

    const newProfile = new StudentProfile({
      userId: newUser._id,
      firstName,
      lastName,
      rollNumber,
      branch: branch || "",
      passoutYear: passoutYear || new Date().getFullYear(),
      createdBy: req.user.id,
    });
    await newProfile.save();

    const emailHtml = `
      <h2>Welcome to CampusBridge!</h2>
      <p>Hello ${firstName},</p>
      <p>Your placement cell has manually registered you.</p>
      <p><strong>Your Temporary Password:</strong> <span style="background:#f4f4f4;padding:4px 8px;letter-spacing:1px;">${tempPassword}</span></p>
      <p>Please log in immediately and change your password.</p>
      <a href="${process.env.CLIENT_URL}/login" style="display:inline-block; padding:10px 20px; background-color:#00ED64; color:#0A192F; text-decoration:none; border-radius:5px; font-weight:bold;">Log In Now</a>
    `;

    await NotificationLog.create({
      studentId: newUser._id,
      subject: "Welcome to CampusBridge! Set your password",
      type: "WELCOME",
      content: emailHtml,
      recipientEmail: email,
      status: "PENDING",
    });

    res.status(201).json({ message: "Student added successfully." });
  } catch (error) {
    console.error("Add Student Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Students with filters
exports.getAllStudents = async (req, res) => {
  try {
    const { status = "ACTIVE", search = "" } = req.query;

    const query = { role: "STUDENT", status };
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    const users = await User.find(query).select("email status isApproved");
    const userIds = users.map(u => u._id);

    const profiles = await StudentProfile.find({ userId: { $in: userIds } });

    const students = profiles.map(profile => {
      const user = users.find(u => u._id.toString() === profile.userId.toString());
      return {
        id: user._id,
        email: user.email,
        status: user.status,
        firstName: profile.firstName,
        lastName: profile.lastName,
        rollNumber: profile.rollNumber,
        branch: profile.branch,
        passoutYear: profile.passoutYear,
        cgpa: profile.cgpa,
        isLocked: profile.isLocked,
      };
    });

    res
      .status(200)
      .json({ message: "All students fetched successfully", data: students });
  } catch (error) {
    console.error("Get All Students Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Student By Id
exports.getStudentById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -activationTokenHash -resetPasswordOtp");
    if (!user || user.role !== "STUDENT") return res.status(404).json({ message: "Student not found" });

    const StudentProfile = require("../models/StudentProfile");
    const profile = await StudentProfile.findOne({ userId: user._id })
      .populate("createdBy", "email role")
      .populate("updatedBy", "email role");

    const studentData = {
      id: user._id,
      email: user.email,
      status: user.status,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      rollNumber: profile?.rollNumber,
      branch: profile?.branch,
      passoutYear: profile?.passoutYear,
      cgpa: profile?.cgpa,
      activeBacklogs: profile?.activeBacklogs,
      skills: profile?.skills || [],
      resumeUrl: profile?.resumeUrl || "",
      isLocked: profile?.isLocked,
      createdBy: profile?.createdBy ? { email: profile.createdBy.email, role: profile.createdBy.role } : null,
      updatedBy: profile?.updatedBy ? { email: profile.updatedBy.email, role: profile.updatedBy.role } : null
    };

    res.status(200).json({ message: "Student Data fetched successfully", data: studentData });
  } catch (error) {
    console.error("Get Student By Id Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update Student
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, rollNumber, branch, passoutYear, email } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== "STUDENT") return res.status(404).json({ message: "Student not found" });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already in use." });
      user.email = email;
      await user.save();
    }

    const profile = await StudentProfile.findOne({ userId: id });
    if (profile) {
      if (rollNumber && rollNumber !== profile.rollNumber) {
        const rollExists = await StudentProfile.findOne({ rollNumber });
        if (rollExists) return res.status(400).json({ message: "Roll number already in use." });
      }
      
      profile.firstName = firstName || profile.firstName;
      profile.lastName = lastName || profile.lastName;
      profile.rollNumber = rollNumber || profile.rollNumber;
      profile.branch = branch || profile.branch;
      profile.passoutYear = passoutYear || profile.passoutYear;
      profile.updatedBy = req.user.id;
      await profile.save();
    }

    res.status(200).json({ message: "Student updated successfully." });
  } catch (error) {
    console.error("Update Student Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Soft Delete Student
exports.softDeleteStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Student not found" });
    
    user.status = "INACTIVE";
    await user.save();
    
    // lock student profile
    await StudentProfile.findOneAndUpdate({ userId: user._id }, { isLocked: true });

    res.status(200).json({ message: "Student moved to inactive (Soft Deleted)." });
  } catch (error) {
    console.error("Soft Delete Student Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Hard Delete Student
exports.hardDeleteStudent = async (req, res) => {
  try {
    await StudentProfile.findOneAndDelete({ userId: req.params.id });
    await NotificationLog.deleteMany({ studentId: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Student permanently deleted." });
  } catch (error) {
    console.error("Hard Delete Student Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Restore Student
exports.restoreStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Student not found" });
    
    user.status = "ACTIVE";
    await user.save();
    
    res.status(200).json({ message: "Student restored successfully." });
  } catch (error) {
    console.error("Restore Student Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Toggle Lock Student
exports.toggleStudentLock = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: "Student profile not found" });
    
    profile.isLocked = !profile.isLocked;
    await profile.save();
    
    res.status(200).json({ 
      message: `Student ${profile.isLocked ? "locked" : "unlocked"} successfully.`,
      isLocked: profile.isLocked
    });
  } catch (error) {
    console.error("Toggle Lock Student Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
