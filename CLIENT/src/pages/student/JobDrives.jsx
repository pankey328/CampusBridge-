import React, { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowUpRight,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const JobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const { data } = await api.get("/student/drives", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDrives(data.data);
    } catch (error) {
      toast.error("Failed to load job drives");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId) => {
    setIsApplying(true);
    try {
      await api.post(
        "/student/drives/apply",
        { jobDriveId: driveId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Successfully applied to the job drive!");
      setSelectedDrive(null);
      fetchDrives();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white mb-2 tracking-tight">
          Active Job Drives
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Browse open placement opportunities, check eligibility, and apply.
        </p>
      </div>

      {/* Empty State */}
      {drives.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <Building2
            size={48}
            className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
          />
          <h3 className="text-xl font-bold text-[#121212] dark:text-white mb-2">
            No Active Drives
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            There are currently no job drives available to apply for.
          </p>
        </div>
      ) : (
        /* Drive Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((drive) => (
            <div
              key={drive._id}
              className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    {drive.companyId?.logoUrl ? (
                      <div className="w-12 h-12 rounded-[14px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center p-2 shrink-0">
                        <img
                          src={drive.companyId.logoUrl}
                          alt={drive.companyId.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-[14px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-400 shrink-0">
                        <Building2 size={20} />
                      </div>
                    )}
                    <div>
                      <h3
                        className="text-lg font-extrabold text-[#121212] dark:text-white truncate max-w-[150px]"
                        title={drive.companyId?.name}
                      >
                        {drive.companyId?.name}
                      </h3>
                      <p className="text-[#034D35] dark:text-[#B6F596] text-xs font-bold uppercase tracking-wider mt-0.5">
                        {drive.jobRole}
                      </p>
                    </div>
                  </div>

                  {drive.isApplied && (
                    <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center shrink-0">
                      <CheckCircle2 size={12} className="mr-1" /> Applied
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <DollarSign
                      size={16}
                      className="mr-2 text-[#034D35] dark:text-[#B6F596]"
                    />
                    <span className="text-[#121212] dark:text-gray-200 font-bold">
                      {drive.packageLPA} LPA
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <MapPin
                      size={16}
                      className="mr-2 text-gray-400 dark:text-gray-500"
                    />
                    <span>{drive.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm font-medium">
                    <Calendar
                      size={16}
                      className="mr-2 text-gray-400 dark:text-gray-500"
                    />
                    <span>
                      Deadline: {new Date(drive.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {!drive.isEligible && !drive.isApplied && (
                <div className="mb-5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 flex items-start font-medium">
                  <AlertCircle size={14} className="mr-1.5 shrink-0 mt-0.5" />
                  <span>Not Eligible: {drive.ineligibilityReason}</span>
                </div>
              )}

              <button
                onClick={() => setSelectedDrive(drive)}
                className="w-full py-3 bg-[#F9F7F1] dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 text-[#121212] dark:text-white border border-gray-200 dark:border-slate-600 rounded-full transition-all text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Details</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drive Details Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-[32px] border border-gray-200 dark:border-slate-700 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 md:p-8 bg-[#F9F7F1] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex justify-between items-start transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                {selectedDrive.companyId?.logoUrl ? (
                  <div className="w-16 h-16 rounded-[18px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center p-2 shrink-0 shadow-sm">
                    <img
                      src={selectedDrive.companyId.logoUrl}
                      alt={selectedDrive.companyId.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-[18px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                    <Building2 size={28} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-extrabold text-[#121212] dark:text-white leading-tight">
                    {selectedDrive.jobRole}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wide mt-1">
                    {selectedDrive.companyId?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDrive(null)}
                className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">
                    Role
                  </p>
                  <p className="font-extrabold text-[#121212] dark:text-white text-sm">
                    {selectedDrive.jobRole}
                  </p>
                </div>
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">
                    Package
                  </p>
                  <p className="font-extrabold text-[#034D35] dark:text-[#B6F596] text-sm">
                    ₹{selectedDrive.packageLPA} LPA
                  </p>
                </div>
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">
                    Location
                  </p>
                  <p className="font-extrabold text-[#121212] dark:text-white text-sm">
                    {selectedDrive.location}
                  </p>
                </div>
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">
                    Deadline
                  </p>
                  <p className="font-extrabold text-red-600 dark:text-red-400 text-sm">
                    {new Date(selectedDrive.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* JD Section */}
              <div>
                <h3 className="text-lg font-extrabold text-[#121212] dark:text-white mb-4 flex items-center">
                  <BookOpen
                    size={20}
                    className="mr-2 text-[#034D35] dark:text-[#B6F596]"
                  />
                  Job Description
                </h3>
                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-[#F9F7F1] dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50 font-medium">
                  {selectedDrive.description}
                </div>
                {selectedDrive.jdFileUrl && (
                  <div className="mt-4">
                    <a
                      href={selectedDrive.jdFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full text-xs font-bold text-[#121212] dark:text-white transition-all shadow-sm"
                    >
                      <BookOpen
                        size={16}
                        className="text-[#034D35] dark:text-[#B6F596]"
                      />
                      <span>View Official JD Document (PDF)</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Eligibility Criteria */}
              <div>
                <h4 className="text-lg font-extrabold text-[#121212] dark:text-white mb-4 flex items-center">
                  <AlertCircle className="mr-2 text-amber-500" size={20} />
                  Eligibility Criteria
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center text-sm shadow-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">
                      Min CGPA
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {selectedDrive.minCgpa}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center text-sm shadow-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">
                      Max Backlogs
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {selectedDrive.maxBacklogs}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center text-sm shadow-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">
                      Passout Year
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {selectedDrive.passoutYear}
                    </span>
                  </div>
                </div>
                {selectedDrive.eligibleBranches &&
                  selectedDrive.eligibleBranches.length > 0 && (
                    <div className="mt-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                      <span className="text-gray-500 dark:text-gray-400 text-xs block mb-3 font-bold uppercase tracking-wider">
                        Eligible Branches
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedDrive.eligibleBranches.map((b) => (
                          <span
                            key={b}
                            className="bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-gray-200 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-slate-700"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Selection Rounds */}
              {selectedDrive.rounds && selectedDrive.rounds.length > 0 && (
                <div>
                  <h4 className="text-lg font-extrabold text-[#121212] dark:text-white mb-4 flex items-center">
                    <Calendar className="mr-2 text-indigo-500" size={20} />
                    Selection Rounds
                  </h4>
                  <div className="space-y-3">
                    {selectedDrive.rounds.map((round, idx) => (
                      <div
                        key={round._id || idx}
                        className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center shadow-sm"
                      >
                        <div className="bg-[#F9F7F1] dark:bg-slate-900 text-[#034D35] dark:text-[#B6F596] w-10 h-10 rounded-full flex items-center justify-center font-extrabold mr-4 mb-3 md:mb-0 shrink-0 border border-gray-200 dark:border-slate-700">
                          {round.order || idx + 1}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#121212] dark:text-white text-base">
                            {round.name}
                          </p>
                          {round.description && (
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                              {round.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-end gap-4 rounded-b-[32px]">
              <button
                onClick={() => setSelectedDrive(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors font-bold text-sm"
              >
                Cancel
              </button>

              {!selectedDrive.isApplied && (
                <button
                  onClick={() => handleApply(selectedDrive._id)}
                  disabled={
                    !selectedDrive.isEligible ||
                    isApplying ||
                    new Date(selectedDrive.deadline) < new Date()
                  }
                  className={`w-full sm:w-auto px-8 py-3 rounded-full font-bold transition-all shadow-sm text-sm flex items-center justify-center gap-2 ${
                    new Date(selectedDrive.deadline) < new Date()
                      ? "bg-red-50 text-red-500 border border-red-200 dark:bg-red-900/30 dark:border-red-800/50 cursor-not-allowed"
                      : selectedDrive.isEligible
                        ? "bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35]"
                        : "bg-gray-100 text-gray-400 border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {new Date(selectedDrive.deadline) < new Date()
                    ? "Deadline Passed"
                    : isApplying
                      ? "Applying..."
                      : selectedDrive.isEligible
                        ? "Apply Now"
                        : "Not Eligible to Apply"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDrives;
