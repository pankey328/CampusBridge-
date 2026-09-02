const mongoose = require("mongoose");
const InterviewSlot = require("../models/InterviewSlot");
const JobDrive = require("../models/JobDrive");
const Application = require("../models/Application");
const NotificationLog = require("../models/NotificationLog");
const User = require("../models/User");
const { sendMail } = require("../utils/emailUtils");

// Bulk schedule interviews
exports.bulkScheduleInterviews = async (req, res) => {
  try {
    const { id } = req.params; // jobDriveId
    const {
      studentIds,
      mode,
      venueBuilding,
      venueRoom,
      meetingLink,
      slotDate,
      startTime,
      durationMinutes,
    } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "No students selected for scheduling." });
    }

    if (!mode || !slotDate || !startTime || !durationMinutes) {
      return res.status(400).json({ message: "Missing required scheduling parameters." });
    }

    const drive = await JobDrive.findById(id).populate("companyId", "name");
    if (!drive) return res.status(404).json({ message: "Job Drive not found." });

    if (req.user.role === "HR" && drive.postedByHR?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to schedule for this drive." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const students = await User.find({ _id: { $in: studentIds } });
      const studentMap = students.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr;
        return acc;
      }, {});

      const createdSlots = [];
      let currentStartTime = new Date(`${slotDate}T${startTime}:00`);

      for (const studentId of studentIds) {
        const endTime = new Date(currentStartTime.getTime() + durationMinutes * 60000);

        let currentSlot = await InterviewSlot.findOne({ jobDriveId: id, studentId: studentId }).session(session);

        if (currentSlot) {
          currentSlot.mode = mode;
          currentSlot.venueBuilding = venueBuilding;
          currentSlot.venueRoom = venueRoom;
          currentSlot.meetingLink = meetingLink;
          currentSlot.slotDate = new Date(slotDate);
          currentSlot.startTime = currentStartTime;
          currentSlot.endTime = endTime;
          currentSlot.status = "RESCHEDULED";
          await currentSlot.save({ session });
          createdSlots.push(currentSlot);
        } else {
          currentSlot = new InterviewSlot({
            jobDriveId: id,
            studentId: studentId,
            mode,
            venueBuilding,
            venueRoom,
            meetingLink,
            slotDate: new Date(slotDate),
            startTime: currentStartTime,
            endTime: endTime,
            status: "SCHEDULED",
          });
          await currentSlot.save({ session });
          createdSlots.push(currentSlot);
        }

        // Update Application Status
        await Application.findOneAndUpdate(
          { jobDriveId: id, studentId: studentId },
          { status: "INTERVIEW_SCHEDULED" },
          { session }
        );

        // Add 5 min buffer for next student
        currentStartTime = new Date(endTime.getTime() + 5 * 60000);

        // Send Email Notification
        const student = studentMap[studentId];
        if (student) {
          const subject = `Interview Scheduled: ${drive.title}`;
          const venueDetails = mode === 'ONLINE' 
            ? `<b>Meeting Link:</b> <a href="${meetingLink}">${meetingLink}</a>`
            : `<b>Venue:</b> ${venueBuilding}, Room ${venueRoom}`;
            
          const formattedDate = new Date(slotDate).toLocaleDateString();
          const formattedTime = currentSlot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const content = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin: 0; padding: 0; background-color: #F9F7F1; font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9F7F1; padding: 30px 12px;">
                <tr>
                  <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                      <tr>
                        <td style="background-color: #B6F596; padding: 24px 32px; border-bottom: 1px solid rgba(3, 77, 53, 0.1);">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <span style="font-size: 24px; font-weight: 800; color: #034D35; letter-spacing: -1px;">CampusBridge</span>
                              </td>
                              <td align="right">
                                <span style="background-color: rgba(3, 77, 53, 0.12); color: #034D35; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">Interview Slot</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 32px 32px 28px 32px;">
                          <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #121212;">Interview Scheduled!</h2>
                          <p style="margin: 0 0 16px 0; font-size: 15px; color: #4B5563; line-height: 1.6;">
                            Congratulations! Your interview for the <strong>${drive.title}</strong> role at <strong>${drive.companyId ? drive.companyId.name : 'the company'}</strong> has been scheduled.
                          </p>
                          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin: 20px 0;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding: 5px 0; font-size: 14px; color: #64748B; width: 35%;">Date:</td>
                                <td style="padding: 5px 0; font-size: 14px; font-weight: 700; color: #0F172A;">${formattedDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 14px; color: #64748B;">Time:</td>
                                <td style="padding: 5px 0; font-size: 14px; font-weight: 700; color: #0F172A;">${formattedTime}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 14px; color: #64748B;">Duration:</td>
                                <td style="padding: 5px 0; font-size: 14px; font-weight: 600; color: #0F172A;">${durationMinutes} mins</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 14px; color: #64748B;">Mode:</td>
                                <td style="padding: 5px 0; font-size: 14px; font-weight: 700; color: #049669;">${mode}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 14px; color: #64748B;">Venue / Link:</td>
                                <td style="padding: 5px 0; font-size: 14px; color: #0F172A;">${venueDetails}</td>
                              </tr>
                            </table>
                          </div>
                          <p style="margin: 0; font-size: 13px; color: #6B7280;">
                            Please ensure you are ready 5 minutes before your scheduled time. Best of luck!
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #FAFAF9; padding: 20px 32px; border-top: 1px solid #F3F4F6; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                            CampusBridge &bull; Placement Operating System<br>
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

          const log = new NotificationLog({
            recipientEmail: student.email,
            studentId: student._id,
            subject,
            content,
            type: 'INTERVIEW_SCHEDULED',
            status: "PENDING",
            attempts: 1
          });

          try {
            await sendMail(student.email, subject, content);
            log.status = "DELIVERED";
            log.deliveredAt = new Date();
          } catch (err) {
            console.error(`Failed to send interview email to ${student.email}`, err);
            log.status = "FAILED";
            log.errorMessage = err.message || "Unknown error";
          }
          await log.save();
        }
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: `Successfully scheduled interviews for ${createdSlots.length} students.`,
        slots: createdSlots,
      });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }
  } catch (error) {
    console.error("Bulk Schedule Interviews Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
