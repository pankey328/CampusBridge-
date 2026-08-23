const StudentProfile = require("../models/StudentProfile");
const Application = require("../models/Application");
const JobDrive = require("../models/JobDrive");

// TPO / SuperAdmin Reports
exports.getAdminPlacementStats = async (req, res) => {
  try {
    const { reportType } = req.query; // 'branch-stats', 'unplaced-students', 'placed-students'
    
    if (reportType === 'unplaced-students') {
      const allProfiles = await StudentProfile.find({ isLocked: false }).populate("userId", "email");
      const data = allProfiles.map(p => ({
        "Name": `${p.firstName} ${p.lastName}`.trim(),
        "Roll Number": p.rollNumber,
        "Email": p.userId?.email || "",
        "Phone": p.phone || "",
        "Branch": p.branch || "N/A",
        "CGPA": p.cgpa || 0,
        "Passout Year": p.passoutYear
      }));
      return res.status(200).json({ data });
    }
    
    if (reportType === 'placed-students') {
      const hiredApps = await Application.find({ status: 'HIRED' })
        .populate({ path: "studentId", select: "email" })
        .populate({ path: "jobDriveId", select: "title companyId", populate: { path: "companyId", select: "name" } });
        
      const studentIds = hiredApps.map(a => a.studentId?._id);
      const profiles = await StudentProfile.find({ userId: { $in: studentIds } });
      
      const data = hiredApps.map(app => {
        const p = profiles.find(profile => profile.userId.toString() === app.studentId?._id.toString());
        return {
          "Name": p ? `${p.firstName} ${p.lastName}`.trim() : "Unknown",
          "Roll Number": p ? p.rollNumber : "N/A",
          "Email": app.studentId?.email || "",
          "Branch": p ? p.branch : "N/A",
          "Company": app.jobDriveId?.companyId?.name || "Unknown",
          "Job Role": app.jobDriveId?.title || "Unknown"
        };
      });
      return res.status(200).json({ data });
    }
    
    if (reportType === 'branch-stats') {
      const profiles = await StudentProfile.find();
      const stats = {};
      
      profiles.forEach(p => {
        const branch = p.branch || "Unspecified";
        if (!stats[branch]) stats[branch] = { total: 0, placed: 0 };
        stats[branch].total += 1;
        if (p.isLocked) stats[branch].placed += 1; 
      });
      
      const data = Object.keys(stats).map(branch => {
        const { total, placed } = stats[branch];
        const unplaced = total - placed;
        const percentage = total > 0 ? ((placed / total) * 100).toFixed(2) + '%' : '0%';
        return {
          "Branch": branch,
          "Total Students": total,
          "Placed": placed,
          "Unplaced": unplaced,
          "Placement %": percentage
        };
      });
      return res.status(200).json({ data });
    }

    return res.status(400).json({ message: "Invalid report type" });
  } catch (error) {
    console.error("Admin Report Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// HR Reports
exports.getHRDriveStats = async (req, res) => {
  try {
    const { reportType } = req.query; // 'applicants', 'hired'
    
    const myDrives = await JobDrive.find({ postedByHR: req.user.id });
    const driveIds = myDrives.map(d => d._id);
    
    let query = { jobDriveId: { $in: driveIds } };
    if (reportType === 'hired') {
      query.status = 'HIRED';
    }
    
    const apps = await Application.find(query)
      .populate({ path: "studentId", select: "email" })
      .populate({ path: "jobDriveId", select: "title" });
      
    const studentIds = apps.map(a => a.studentId?._id);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } });
    
    const data = apps.map(app => {
      const p = profiles.find(profile => profile.userId.toString() === app.studentId?._id.toString());

      return {
        "Drive Title": app.jobDriveId?.title || "Unknown",
        "Applicant Name": p ? `${p.firstName} ${p.lastName}`.trim() : "Unknown",
        "Roll Number": p ? p.rollNumber : "N/A",
        "Email": app.studentId?.email || "",
        "Branch": p ? p.branch : "N/A",
        "CGPA": p ? p.cgpa : "N/A",
        "Application Status": app.status
      };
    });

    return res.status(200).json({ data });
  } catch (error) {
    console.error("HR Report Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
