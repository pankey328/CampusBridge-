import React, { useState } from "react";
import { X, Calendar, Clock, Video, MapPin, Users } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const InterviewScheduleModal = ({
  isOpen,
  onClose,
  selectedStudents,
  jobDriveId,
  _basePath,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mode: "ONLINE",
    slotDate: "",
    startTime: "",
    durationMinutes: 20,
    meetingLink: "",
    venueBuilding: "",
    venueRoom: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        studentIds: selectedStudents.map(
          (app) => app.studentId._id || app.studentId,
        ),
        ...formData,
        durationMinutes: Number(formData.durationMinutes),
      };

      await api.post(`/interviews/job-drives/${jobDriveId}/schedule`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success(
        `Successfully scheduled interviews for ${selectedStudents.length} students!`,
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to schedule interviews",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-slate-700 animate-slide-up transition-colors duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-[#F9F7F1] dark:bg-slate-900 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
              Schedule Interviews
            </h2>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 flex items-center uppercase tracking-wider">
              <Users size={14} className="mr-1.5 text-blue-500" />
              Scheduling for {selectedStudents.length} selected students
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="slotDate"
                  required
                  value={formData.slotDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Mode */}
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mode <span className="text-red-500">*</span>
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm cursor-pointer"
              >
                <option value="ONLINE">Online (Virtual)</option>
                <option value="ON_CAMPUS">Offline (On-Campus)</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duration (Mins/Student) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durationMinutes"
                required
                min="5"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
              />
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                A 5-min buffer is added automatically
              </p>
            </div>

            {/* Conditional Fields based on Mode */}
            {formData.mode === "ONLINE" ? (
              <div className="space-y-1.5 col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Meeting Link (GMeet / Zoom){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="meetingLink"
                    required
                    placeholder="https://meet.google.com/..."
                    value={formData.meetingLink}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Building <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="venueBuilding"
                      required
                      placeholder="e.g. Main Block"
                      value={formData.venueBuilding}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="venueRoom"
                    required
                    placeholder="e.g. Room 402"
                    value={formData.venueRoom}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-slate-700 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-2.5 px-6 rounded-full transition-all shadow-md text-sm disabled:opacity-50 min-w-[160px]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Confirm Schedule</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduleModal;
