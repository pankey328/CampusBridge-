const mongoose = require("mongoose");
const InterviewSlot = require("../models/InterviewSlot");
const JobDrive = require("../models/JobDrive");
const Application = require("../models/Application");
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

    const drive = await JobDrive.findById(id);
    if (!drive) return res.status(404).json({ message: "Job Drive not found." });

    if (req.user.role === "HR" && drive.postedByHR?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to schedule for this drive." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const createdSlots = [];
      let currentStartTime = new Date(`${slotDate}T${startTime}:00`);

      for (const studentId of studentIds) {
        const endTime = new Date(currentStartTime.getTime() + durationMinutes * 60000);

        const newSlot = new InterviewSlot({
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

        await newSlot.save({ session });
        createdSlots.push(newSlot);

        // Update Application Status
        await Application.findOneAndUpdate(
          { jobDriveId: id, studentId: studentId },
          { status: "INTERVIEW_SCHEDULED" },
          { session }
        );

        // Add 5 min buffer for next student
        currentStartTime = new Date(endTime.getTime() + 5 * 60000);
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
