const mongoose = require("mongoose");
const JobDrive = require("../models/JobDrive");
const Company = require("../models/Company");
const User = require("../models/User");
const Application = require("../models/Application");
const StudentProfile = require("../models/StudentProfile");
const HRProfile = require("../models/HRProfile");
const InterviewSlot = require("../models/InterviewSlot");
const NotificationLog = require("../models/NotificationLog");
const { sendMail } = require("../utils/emailUtils");

// Create Job Drive
exports.createJobDrive = async (req, res) => {
  try {
    const {
      companyId,
      postedByHR,
      title,
      jobRole,
      description,
      eligibleBranches,
      minCgpa,
      maxBacklogs,
      passoutYear,
      packageLPA,
      location,
      driveDate,
      deadline,
      status,
      rounds,
    } = req.body;

    let finalCompanyId = companyId;
    let finalPostedByHR = postedByHR;

    if (req.user.role === "HR") {
      const hrProfile = await HRProfile.findOne({ userId: req.user.id });
      if (!hrProfile) {
        return res.status(404).json({ message: "HR Profile not found" });
      }
      const company = await Company.findOne({ name: hrProfile.companyName });
      if (!company) {
        return res.status(404).json({ message: "Company not found for this HR" });
      }
      finalCompanyId = company._id;
      finalPostedByHR = req.user.id;
    }

    const newJobDrive = new JobDrive({
      companyId: finalCompanyId,
      postedByHR: finalPostedByHR,
      title,
      jobRole,
      description,
      jdFileUrl: req.body.jdFileUrl || "",
      eligibleBranches,
      minCgpa,
      maxBacklogs,
      passoutYear,
      packageLPA,
      location,
      driveDate,
      deadline,
      status: status || "DRAFT",
      rounds: rounds || [],
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    await newJobDrive.save();
    res.status(201).json({ message: "Job drive created successfully", jobDrive: newJobDrive });
  } catch (error) {
    console.error("Create Job Drive Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Job Drives
exports.getAllJobDrives = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const status = req.query.status || 'ALL';
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'deadline_soon') {
      sortObj = { deadline: 1 };
    } else if (sort === 'deadline_late') {
      sortObj = { deadline: -1 };
    } else if (sort === 'salary_high') {
      sortObj = { packageLPA: -1 };
    } else if (sort === 'salary_low') {
      sortObj = { packageLPA: 1 };
    } else if (sort === 'title_az') {
      sortObj = { title: 1 };
    } else if (sort === 'title_za') {
      sortObj = { title: -1 };
    }

    const query = {
      $and: [
        {
          $or: [
            { status: { $ne: 'DRAFT' } },
            { status: 'DRAFT', createdBy: req.user.id }
          ]
        }
      ]
    };

    if (status !== 'ALL') {
      query.$and.push({ status: status });
    }

    if (search) {
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const skip = (page - 1) * limit;
    const totalRows = await JobDrive.countDocuments(query);
    const totalPages = Math.ceil(totalRows / limit);

    const jobDrives = await JobDrive.find(query)
      .populate("companyId", "name logoUrl")
      .populate("postedByHR", "email")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      message: "Job drives fetched successfully", 
      data: jobDrives,
      pagination: {
        page,
        limit,
        totalRows,
        totalPages
      }
    });
  } catch (error) {
    console.error("Get All Job Drives Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get HR Specific Job Drives
exports.getHRJobDrives = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const status = req.query.status || 'ALL';
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';
    
    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'deadline_soon') {
      sortObj = { deadline: 1 };
    } else if (sort === 'deadline_late') {
      sortObj = { deadline: -1 };
    } else if (sort === 'salary_high') {
      sortObj = { packageLPA: -1 };
    } else if (sort === 'salary_low') {
      sortObj = { packageLPA: 1 };
    } else if (sort === 'title_az') {
      sortObj = { title: 1 };
    } else if (sort === 'title_za') {
      sortObj = { title: -1 };
    }

    const query = { postedByHR: req.user.id };

    if (status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const totalRows = await JobDrive.countDocuments(query);
    const totalPages = Math.ceil(totalRows / limit);

    const jobDrives = await JobDrive.find(query)
      .populate("companyId", "name")
      .populate("postedByHR", "email")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      message: "Job drives fetched successfully", 
      data: jobDrives,
      pagination: {
        page,
        limit,
        totalRows,
        totalPages
      }
    });
  } catch (error) {
    console.error("Get HR Job Drives Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Job Drive By Id
exports.getJobDriveById = async (req, res) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id)
      .populate("companyId", "name industry")
      .populate("postedByHR", "email")
      .populate("createdBy", "email role")
      .populate("updatedBy", "email role");

    if (!jobDrive) {
      return res.status(404).json({ message: "Job drive not found" });
    }

    res.status(200).json({ message: "Job drive fetched successfully", data: jobDrive });
  } catch (error) {
    console.error("Get Job Drive By Id Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update Job Drive
exports.updateJobDrive = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const jobDrive = await JobDrive.findById(req.params.id).populate("postedByHR", "email");
    if (!jobDrive) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Job drive not found" });
    }

    const postedById = jobDrive.postedByHR?._id ? jobDrive.postedByHR._id.toString() : jobDrive.postedByHR?.toString();
    if (req.user.role === "HR" && postedById !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Not authorized to update this job drive" });
    }

    if (req.user.role === "HR" && jobDrive.status === "ACTIVE" && req.body.status !== "CANCELLED") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Active job drives cannot be edited. Please contact the Admin." });
    }

    for (const key in req.body) {
      jobDrive[key] = req.body[key];
    }
    jobDrive.updatedBy = req.user.id;

    if (req.body.status === "PENDING_APPROVAL" || req.body.status === "ACTIVE") {
      jobDrive.rejectionReason = "";
    }

    if (req.body.status === "REJECTED" && req.body.rejectionReason) {
      const subject = "Job Drive Rejected";
      const content = `<h3>Job Drive Update</h3><p>Your job drive submission for <b>${jobDrive.title}</b> has been returned by the Placement Cell.</p>
                       <p><b>Reason:</b> ${req.body.rejectionReason}</p>
                       <p>Please review the feedback, make the necessary corrections, and resubmit.</p>`;
      
      const log = new NotificationLog({
        recipientEmail: jobDrive.postedByHR.email,
        subject,
        content,
        type: "GENERAL",
        status: "PENDING",
        attempts: 1
      });

      try {
        await sendMail(jobDrive.postedByHR.email, subject, content);
        log.status = "DELIVERED";
        log.deliveredAt = new Date();
      } catch (err) {
        console.error(`Failed to send rejection email to ${jobDrive.postedByHR.email}`, err);
        log.status = "FAILED";
        log.errorMessage = err.message || "Unknown error";
      }
      await log.save({ session });
    }

    if (req.body.status === "CANCELLED") {

      const slots = await InterviewSlot.find({ jobDriveId: jobDrive._id, status: { $in: ["SCHEDULED", "RESCHEDULED"] } }).populate('studentId', 'email');
      
      if (slots.length > 0) {
        for (const slot of slots) {
          slot.status = "CANCELLED";
          await slot.save({ session });

          const subject = "Interview Cancelled";
          const content = `<h3>Interview Cancelled</h3><p>We regret to inform you that the interview and job drive for <b>${jobDrive.title}</b> has been cancelled by the company.</p>`;
          
          const log = new NotificationLog({
            recipientEmail: slot.studentId.email,
            studentId: slot.studentId._id,
            subject,
            content,
            type: "INTERVIEW_CANCELLED",
            status: "PENDING",
            attempts: 1
          });

          try {
            await sendMail(slot.studentId.email, subject, content);
            log.status = "DELIVERED";
            log.deliveredAt = new Date();
          } catch (err) {
            console.error(`Failed to send cancellation email to ${slot.studentId.email}`, err);
            log.status = "FAILED";
            log.errorMessage = err.message || "Unknown error";
          }
          await log.save({ session });
        }
      }
    }

    await jobDrive.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Job drive updated successfully", jobDrive });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Update Job Drive Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Job Drive
exports.deleteJobDrive = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Job drive not found" });
    }

    if (req.user.role === "HR" && jobDrive.postedByHR?.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "Not authorized to delete this job drive" });
    }

    const slots = await InterviewSlot.find({ jobDriveId: jobDrive._id, status: { $in: ["SCHEDULED", "RESCHEDULED"] } }).populate('studentId', 'email');
    if (slots.length > 0) {
      for (const slot of slots) {
        slot.status = "CANCELLED";
        await slot.save({ session });
        const subject = "Job Drive Cancelled";
        const content = `<h3>Job Drive Cancelled</h3><p>We regret to inform you that the job drive for <b>${jobDrive.title}</b> has been deleted by the company.</p>`;

        const log = new NotificationLog({
          recipientEmail: slot.studentId.email,
          studentId: slot.studentId._id,
          subject,
          content,
          type: "INTERVIEW_CANCELLED",
          status: "PENDING",
          attempts: 1
        });

        try {
          await sendMail(slot.studentId.email, subject, content);
          log.status = "DELIVERED";
          log.deliveredAt = new Date();
        } catch (err) {
          console.error(`Failed to send cancellation email to ${slot.studentId.email}`, err);
          log.status = "FAILED";
          log.errorMessage = err.message || "Unknown error";
        }
        await log.save({ session });
      }
    }

    jobDrive.status = "CANCELLED";
    await jobDrive.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Job drive deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Delete Job Drive Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Application Tracking: Get All Applications for a Drive
exports.getDriveApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, search = "", status = "ALL", sort = "newest" } = req.query;
    
    const drive = await JobDrive.findById(id);
    if (!drive) return res.status(404).json({ message: "Job drive not found" });

    const applications = await Application.find({ jobDriveId: id }).populate("studentId", "email");
    const studentIds = applications.map(app => app.studentId._id);
    
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } });

    let enrichedApplications = applications.map(app => {
      const profile = profiles.find(p => p.userId.toString() === app.studentId._id.toString());
      return {
        _id: app._id,
        studentId: app.studentId._id,
        email: app.studentId.email,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        rollNumber: profile?.rollNumber,
        branch: profile?.branch,
        cgpa: profile?.cgpa,
        activeBacklogs: profile?.activeBacklogs,
        passoutYear: profile?.passoutYear,
        phone: profile?.phone,
        linkedinUrl: profile?.linkedinUrl,
        githubUrl: profile?.githubUrl,
        resumeUrl: profile?.resumeUrl,
        skills: profile?.skills || [],
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      };
    });

    if (status && status !== "ALL") {
      enrichedApplications = enrichedApplications.filter(app => app.status === status);
    }
    
    // Search
    if (search) {
      const s = search.toLowerCase().trim();
      enrichedApplications = enrichedApplications.filter(app => {
        const fullName = `${app.firstName || ''} ${app.lastName || ''}`.toLowerCase().trim();
        return (
          fullName.includes(s) ||
          (app.firstName && app.firstName.toLowerCase().includes(s)) ||
          (app.lastName && app.lastName.toLowerCase().includes(s)) ||
          (app.email && app.email.toLowerCase().includes(s)) ||
          (app.rollNumber && app.rollNumber.toLowerCase().includes(s)) ||
          (app.branch && app.branch.toLowerCase().includes(s))
        );
      });
    }

    // Sorting
    enrichedApplications.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'cgpa_high':
          return (b.cgpa || 0) - (a.cgpa || 0);
        case 'cgpa_low':
          return (a.cgpa || 0) - (b.cgpa || 0);
        case 'name_az':
          return (a.firstName || '').localeCompare(b.firstName || '');
        case 'name_za':
          return (b.firstName || '').localeCompare(a.firstName || '');
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = enrichedApplications.slice(startIndex, endIndex);

    res.status(200).json({ 
      message: "Applications fetched successfully", 
      data: paginatedData,
      pagination: {
        totalDocuments: enrichedApplications.length,
        totalPages: Math.ceil(enrichedApplications.length / limitNum),
        currentPage: pageNum,
        limit: limitNum
      },
      driveStatus: drive.status 
    });
  } catch (error) {
    console.error("Get Drive Applications Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Application Tracking: Update Single Application Status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findById(applicationId).populate('studentId', 'email').populate('jobDriveId', 'title');
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();

    if (status === 'REJECTED' || status === 'HIRED' || status === 'SHORTLISTED') {
      let subject = '';
      let content = '';
      let logType = '';

      if (status === 'REJECTED') {
        subject = 'Update on your Application';
        content = `<p>Thank you for your interest in the <b>${application.jobDriveId.title}</b> role. We regret to inform you that we will not be moving forward with your application.</p>`;
        logType = 'APPLICATION_REJECTED';
      } else if (status === 'HIRED') {
        subject = 'Congratulations! You have been Selected';
        content = `<p>Congratulations! You have been selected for the <b>${application.jobDriveId.title}</b> role! The HR team will reach out shortly with your official offer letter and joining details.</p>`;
        logType = 'APPLICATION_HIRED';
        await StudentProfile.findOneAndUpdate({ userId: application.studentId._id }, { isLocked: true });
      } else if (status === 'SHORTLISTED') {
        subject = 'Update on your Application: Shortlisted!';
        content = `<p>Congratulations! You have been shortlisted for the <b>${application.jobDriveId.title}</b> role! Please stay tuned for further updates regarding the next rounds.</p>`;
        logType = 'APPLICATION_SHORTLISTED';
      }

      const log = new NotificationLog({
        recipientEmail: application.studentId.email,
        studentId: application.studentId._id,
        subject,
        content,
        type: logType,
        status: "PENDING",
        attempts: 1
      });

      try {
        await sendMail(application.studentId.email, subject, content);
        log.status = "DELIVERED";
        log.deliveredAt = new Date();
      } catch (err) {
        console.error(`Failed to send status email to ${application.studentId.email}`, err);
        log.status = "FAILED";
        log.errorMessage = err.message || "Unknown error";
      }
      await log.save();
    }

    res.status(200).json({ message: "Application status updated successfully", application });
  } catch (error) {
    console.error("Update Application Status Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Application Tracking: Bulk Update Applications Status
exports.bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const { applicationIds, status } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ message: "No applications selected" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { $set: { status } }
    );

    if (status === 'REJECTED' || status === 'HIRED' || status === 'SHORTLISTED') {
      const applications = await Application.find({ _id: { $in: applicationIds } })
        .populate('studentId', 'email')
        .populate('jobDriveId', 'title');

      for (const app of applications) {
        let subject = '';
        let content = '';
        let logType = '';

        if (status === 'REJECTED') {
          subject = 'Update on your Application';
          content = `<p>Thank you for your interest in the <b>${app.jobDriveId.title}</b> role. We regret to inform you that we will not be moving forward with your application.</p>`;
          logType = 'APPLICATION_REJECTED';
        } else if (status === 'HIRED') {
          subject = 'Congratulations! You have been Selected';
          content = `<p>Congratulations! You have been selected for the <b>${app.jobDriveId.title}</b> role! The HR team will reach out shortly with your official offer letter and joining details.</p>`;
          logType = 'APPLICATION_HIRED';
          await StudentProfile.findOneAndUpdate({ userId: app.studentId._id }, { isLocked: true });
        } else if (status === 'SHORTLISTED') {
          subject = 'Update on your Application: Shortlisted!';
          content = `<p>Congratulations! You have been shortlisted for the <b>${app.jobDriveId.title}</b> role! Please stay tuned for further updates regarding the next rounds.</p>`;
          logType = 'APPLICATION_SHORTLISTED';
        }

        const log = new NotificationLog({
          recipientEmail: app.studentId.email,
          studentId: app.studentId._id,
          subject,
          content,
          type: logType,
          status: "PENDING",
          attempts: 1
        });

        try {
          await sendMail(app.studentId.email, subject, content);
          log.status = "DELIVERED";
          log.deliveredAt = new Date();
        } catch (err) {
          console.error(`Failed to send bulk status email to ${app.studentId.email}`, err);
          log.status = "FAILED";
          log.errorMessage = err.message || "Unknown error";
        }
        await log.save();
      }
    }

    res.status(200).json({ message: `Successfully updated ${applicationIds.length} applications to ${status}` });
  } catch (error) {
    console.error("Bulk Update Application Status Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Complete Job Drive and Auto-Reject Remaining
exports.completeJobDrive = async (req, res) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) return res.status(404).json({ message: "Job drive not found" });

    if (req.user.role === "HR" && jobDrive.postedByHR?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to complete this job drive" });
    }

    jobDrive.status = "COMPLETED";
    await jobDrive.save();

    const pendingApps = await Application.find({ 
      jobDriveId: jobDrive._id, 
      status: { $in: ['APPLIED', 'SHORTLISTED'] } 
    }).populate('studentId', 'email');

    if (pendingApps.length > 0) {
      const pendingIds = pendingApps.map(app => app._id);
      await Application.updateMany(
        { _id: { $in: pendingIds } },
        { $set: { status: 'REJECTED' } }
      );

      for (const app of pendingApps) {
        const subject = 'Update on your Application';
        const content = `<p>Thank you for your interest in the <b>${jobDrive.title}</b> role. The recruitment process for this drive has concluded, and we regret to inform you that we will not be moving forward with your application.</p>`;

        const log = new NotificationLog({
          recipientEmail: app.studentId.email,
          studentId: app.studentId._id,
          subject,
          content,
          type: 'APPLICATION_REJECTED',
          status: "PENDING",
          attempts: 1
        });

        try {
          await sendMail(app.studentId.email, subject, content);
          log.status = "DELIVERED";
          log.deliveredAt = new Date();
        } catch (err) {
          console.error(`Failed to send auto-rejection email to ${app.studentId.email}`, err);
          log.status = "FAILED";
          log.errorMessage = err.message || "Unknown error";
        }
        await log.save();
      }
    }

    res.status(200).json({ message: "Job drive marked as completed", autoRejectedCount: pendingApps.length });
  } catch (error) {
    console.error("Complete Job Drive Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
