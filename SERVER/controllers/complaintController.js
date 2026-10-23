const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const NotificationLog = require("../models/NotificationLog");
const { evaluateComplaint } = require("../utils/aiService");
const { sendMail } = require("../utils/emailUtils");

const getBasePriority = (type) => {
  switch (type) {
    case "Interview Scheduling":
    case "Placement Drive & Eligibility":
      return "High";
    case "Technical & Platform Issue":
    case "Document & Profile Verification":
      return "Medium";
    case "General / Policy Query":
    default:
      return "Low";
  }
};

const createComplaintEmailHtml = ({
  studentName,
  ticketId,
  complaintType,
  priority,
  subject,
  aiReply,
}) => {
  const priorityColor =
    priority === "Critical"
      ? "#DC2626"
      : priority === "High"
        ? "#EA580C"
        : priority === "Medium"
          ? "#D97706"
          : "#16A34A";

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #F9F7F1; font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F7F1; padding: 32px 12px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #B6F596; padding: 24px 32px; border-bottom: 1px solid rgba(3, 77, 53, 0.1);">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-size: 22px; font-weight: 800; color: #034D35; letter-spacing: -0.5px;">CampusBridge</span>
                        <span style="display: block; font-size: 12px; color: #034D35; opacity: 0.8; font-weight: 600; margin-top: 2px;">AI Grievance & Helpdesk</span>
                      </td>
                      <td align="right">
                        <span style="background-color: #034D35; color: #B6F596; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">Ticket Logged</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 32px 24px 32px;">
                  <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #121212;">Complaint Registered & Evaluated</h2>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #4B5563; line-height: 1.6;">Hello ${studentName},</p>
                  <p style="margin: 0 0 20px 0; font-size: 14px; color: #4B5563; line-height: 1.6;">
                    Your support inquiry has been received and evaluated by the <strong>CampusBridge AI Support System</strong>. Below are your ticket details and initial guidance:
                  </p>

                  <!-- Ticket Details Box -->
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 12px; color: #64748B; font-weight: 600;">TICKET REFERENCE</td>
                        <td align="right" style="padding-bottom: 8px; font-size: 12px; color: #0F172A; font-weight: 700;">#${ticketId}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 12px; color: #64748B; font-weight: 600;">CATEGORY</td>
                        <td align="right" style="padding-bottom: 8px; font-size: 12px; color: #0F172A; font-weight: 600;">${complaintType}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 12px; color: #64748B; font-weight: 600;">PRIORITY</td>
                        <td align="right" style="padding-bottom: 8px; font-size: 12px; color: ${priorityColor}; font-weight: 700;">${priority.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748B; font-weight: 600;">SUBJECT</td>
                        <td align="right" style="font-size: 12px; color: #0F172A; font-weight: 600;">${subject}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- AI Response Box -->
                  <div style="background-color: #F0FDF4; border-left: 4px solid #16A34A; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">AI Automated Resolution & Advice:</div>
                    <p style="margin: 0; font-size: 14px; color: #14532D; line-height: 1.6; white-space: pre-line;">
                      ${aiReply}
                    </p>
                  </div>

                  <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748B; line-height: 1.6;">
                    If this is a critical issue requiring further human intervention, your complaint has also been logged in the SuperAdmin / Placement Cell queue and an officer will take necessary steps.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #FAFAF9; padding: 20px 32px; border-top: 1px solid #F3F4F6; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                    CampusBridge &bull; AI Powered Grievance System<br>
                    Bridging corporate hiring with student potential.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Submit student complaint -> AI Evaluation -> Send Mail -> DB Transaction /api/complaints
exports.createComplaint = async (req, res) => {
  const { complaintType, subject, description } = req.body;

  if (!complaintType || !subject || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide complaintType, subject, and description.",
    });
  }

  // Find user and student profile
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const profile = await StudentProfile.findOne({ userId: req.user.id });
  const studentName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "Student";
  const studentEmail = user.email;

  // Determine base priority from complaint type
  const basePriority = getBasePriority(complaintType);

  // Handover to AI for Evaluation & Automatic Response
  let aiEvaluation;
  try {
    aiEvaluation = await evaluateComplaint({
      complaintType,
      subject,
      description,
      studentName,
    });
  } catch (aiErr) {
    console.error("AI Step Failed:", aiErr.message);
    return res.status(502).json({
      success: false,
      message: `AI Evaluation failed: ${aiErr.message}. No complaint was registered. Please retry.`,
    });
  }

  const finalPriority = aiEvaluation.urgency || basePriority;
  const tempTicketRef = new mongoose.Types.ObjectId();
  const ticketRefShort = tempTicketRef.toString().slice(-6).toUpperCase();

  // Send Email to Student with AI Response
  const emailHtml = createComplaintEmailHtml({
    studentName,
    ticketId: ticketRefShort,
    complaintType,
    priority: finalPriority,
    subject,
    aiReply: aiEvaluation.aiReply,
  });

  try {
    await sendMail(
      studentEmail,
      `[Ticket #${ticketRefShort}] Complaint Registered: ${subject}`,
      emailHtml
    );
  } catch (mailErr) {
    console.error("Email Step Failed:", mailErr.message);
    return res.status(500).json({
      success: false,
      message: `Email delivery to ${studentEmail} failed: ${mailErr.message}. The complaint was not saved. Please try again.`,
    });
  }

  // Save to Database with Transaction (Atomic Rollback on Error)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const complaint = new Complaint(
      {
        _id: tempTicketRef,
        student: user._id,
        studentProfile: profile ? profile._id : null,
        complaintType,
        priority: finalPriority,
        subject,
        description,
        aiEvaluation,
        status: "AI-Resolved",
      },
      { session }
    );

    await complaint.save({ session });

    await NotificationLog.create(
      [
        {
          recipientEmail: studentEmail,
          studentId: user._id,
          subject: `[Ticket #${ticketRefShort}] Complaint Registered: ${subject}`,
          content: aiEvaluation.aiReply,
          type: "COMPLAINT_RESOLVED",
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      ],
      { session }
    );

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Complaint evaluated by AI, email delivered, and ticket saved successfully.",
      data: complaint,
    });
  } catch (dbErr) {
    await session.abortTransaction();
    session.endSession();
    console.error("Database Transaction Rollback:", dbErr.message);

    return res.status(500).json({
      success: false,
      message: `Database save transaction failed: ${dbErr.message}. All changes were rolled back.`,
    });
  }
};

// Get current student's complaints  /api/complaints/my
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Get My Complaints Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all complaints with filters (for SuperAdmin & TPO) /api/complaints/admin/all
exports.getAllComplaints = async (req, res) => {
  try {
    const {
      complaintType,
      priority,
      status,
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (complaintType && complaintType !== "ALL") {
      query.complaintType = complaintType;
    }

    if (priority && priority !== "ALL") {
      query.priority = priority;
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ subject: searchRegex }, { description: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate("student", "email role")
        .populate("studentProfile", "firstName lastName rollNumber branch phone")
        .populate("resolvedBy", "email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Complaint.countDocuments(query),
    ]);

    // Aggregate statistics for overview badges
    const [stats] = await Complaint.aggregate([
      {
        $facet: {
          byType: [
            { $group: { _id: "$complaintType", count: { $sum: 1 } } },
          ],
          byPriority: [
            { $group: { _id: "$priority", count: { $sum: 1 } } },
          ],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
      stats: {
        total: stats?.totalCount[0]?.count || 0,
        byType: stats?.byType || [],
        byPriority: stats?.byPriority || [],
        byStatus: stats?.byStatus || [],
      },
    });
  } catch (error) {
    console.error("Get All Complaints Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update complaint status & admin notes /api/complaints/admin/:id
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (status) complaint.status = status;
    if (adminNotes !== undefined) complaint.adminNotes = adminNotes;

    if (status === "Closed" || status === "AI-Resolved") {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = req.user.id;
    }

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Update Complaint Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
