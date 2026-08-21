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
          currentSlot.panelistId = req.user.id;
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
            panelistId: req.user.id,
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
            <p>Congratulations!</p>
            <p>Your interview for the <b>${drive.title}</b> role at <b>${drive.companyId ? drive.companyId.name : 'the company'}</b> has been scheduled.</p>
            <ul>
              <li><b>Date:</b> ${formattedDate}</li>
              <li><b>Time:</b> ${formattedTime}</li>
              <li><b>Duration:</b> ${durationMinutes} minutes</li>
              <li><b>Mode:</b> ${mode}</li>
              <li>${venueDetails}</li>
            </ul>
            <p>Please ensure you are ready 5 minutes before the scheduled time. Best of luck!</p>
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
