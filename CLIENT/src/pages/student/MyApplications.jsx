import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRightCircle,
  Video,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get("/student/applications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setApplications(data.data);
    } catch (error) {
      toast.error("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "APPLIED":
        return {
          color: "text-blue-700 dark:text-blue-300",
          bg: "bg-blue-50 dark:bg-blue-900/30",
          border: "border-blue-200 dark:border-blue-800/50",
          icon: <Clock size={14} className="mr-1.5" />,
          label: "Applied",
        };
      case "SHORTLISTED":
        return {
          color: "text-purple-700 dark:text-purple-300",
          bg: "bg-purple-50 dark:bg-purple-900/30",
          border: "border-purple-200 dark:border-purple-800/50",
          icon: <ArrowRightCircle size={14} className="mr-1.5" />,
          label: "Shortlisted",
        };
      case "INTERVIEW_SCHEDULED":
        return {
          color: "text-indigo-700 dark:text-indigo-300",
          bg: "bg-indigo-50 dark:bg-indigo-900/30",
          border: "border-indigo-200 dark:border-indigo-800/50",
          icon: <Calendar size={14} className="mr-1.5" />,
          label: "Interview Scheduled",
        };
      case "HIRED":
        return {
          color: "text-[#034D35] dark:text-[#B6F596]",
          bg: "bg-[#B6F596]/40 dark:bg-[#034D35]/50",
          border: "border-[#034D35]/20 dark:border-[#B6F596]/20",
          icon: <CheckCircle2 size={14} className="mr-1.5" />,
          label: "Hired",
        };
      case "REJECTED":
        return {
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-900/30",
          border: "border-red-200 dark:border-red-800/50",
          icon: <XCircle size={14} className="mr-1.5" />,
          label: "Rejected",
        };
      default:
        return {
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-slate-800",
          border: "border-gray-200 dark:border-slate-700",
          icon: <Clock size={14} className="mr-1.5" />,
          label: status,
        };
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
          My Applications
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Track and review the real-time status of placement drives you have
          applied for.
        </p>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <Briefcase
            size={48}
            className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
          />
          <h3 className="text-xl font-bold text-[#121212] dark:text-white mb-2">
            No Applications Yet
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            You have not applied to any job drives yet.
          </p>
        </div>
      ) : (
        /* Applications List */
        <div className="space-y-5">
          {applications.map((app) => {
            const drive = app.jobDriveId;
            const statusConfig = getStatusConfig(app.status);
            const slot = app.interviewSlot;

            let canJoin = false;
            let hasEnded = false;
            let timeString = "";

            if (slot) {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);
              const now = new Date();
              const fiveMinsBefore = new Date(start.getTime() - 5 * 60000);
              canJoin = now >= fiveMinsBefore && now <= end;
              hasEnded = now > end;
              timeString = start.toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              });
            }

            return (
              <div
                key={app._id}
                className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Left Side: Drive Info */}
                <div className="flex items-start space-x-4 sm:space-x-5 flex-1">
                  {drive.companyId?.logoUrl ? (
                    <div className="w-14 h-14 rounded-[16px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center p-2 shrink-0 shadow-sm">
                      <img
                        src={drive.companyId.logoUrl}
                        alt={drive.companyId.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-[16px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-gray-400 shadow-sm">
                      <Building2 size={24} />
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-extrabold text-[#121212] dark:text-white leading-tight">
                      {drive.jobRole}
                    </h3>
                    <p className="text-[#034D35] dark:text-[#B6F596] text-xs font-bold uppercase tracking-wider mt-1">
                      {drive.companyId?.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <DollarSign
                          size={16}
                          className="mr-1.5 text-[#034D35] dark:text-[#B6F596]"
                        />
                        <span className="text-[#121212] dark:text-gray-200 font-bold">
                          {drive.packageLPA} LPA
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin
                          size={16}
                          className="mr-1.5 text-gray-400 dark:text-gray-500"
                        />
                        <span>{drive.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar
                          size={16}
                          className="mr-1.5 text-gray-400 dark:text-gray-500"
                        />
                        <span>
                          Applied:{" "}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status & Slot Info */}
                <div className="flex flex-col items-start md:items-end shrink-0 w-full md:w-auto">
                  <span
                    className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center uppercase tracking-wider mb-5 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>

                  {app.status === "INTERVIEW_SCHEDULED" && slot && (
                    <div className="w-full bg-[#F9F7F1] dark:bg-slate-900 p-5 rounded-[20px] border border-gray-100 dark:border-slate-700/50 flex flex-col min-w-[240px] shadow-sm">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        Assigned Slot
                      </p>
                      <p className="text-[#121212] dark:text-white font-extrabold text-sm mb-4">
                        {timeString}
                      </p>

                      {slot.mode === "ONLINE" ? (
                        <>
                          {hasEnded ? (
                            <div className="flex items-center justify-center px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 border border-gray-200 dark:border-slate-700 cursor-not-allowed">
                              <Video size={14} className="mr-1.5 opacity-50" />
                              <span>Interview Ended</span>
                            </div>
                          ) : (
                            <>
                              <a
                                href={canJoin ? slot.meetingLink : "#"}
                                target={canJoin ? "_blank" : "_self"}
                                rel="noreferrer"
                                className={`flex items-center justify-center px-5 py-2.5 rounded-full font-bold text-xs transition-colors shadow-sm ${
                                  canJoin
                                    ? "bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35]"
                                    : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-slate-700 cursor-not-allowed"
                                }`}
                                onClick={(e) => {
                                  if (!canJoin) {
                                    e.preventDefault();
                                    toast(
                                      "Meeting link will activate 5 minutes before the start time.",
                                      { icon: "⏳" },
                                    );
                                  }
                                }}
                              >
                                <Video size={14} className="mr-1.5" />
                                {canJoin ? "Join Interview" : "Locked"}
                              </a>
                              {!canJoin && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-2 text-center">
                                  Unlocks 5 mins before start
                                </p>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col text-xs shadow-sm">
                          <span className="font-bold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider mb-1">
                            Venue
                          </span>
                          <span className="font-extrabold text-[#121212] dark:text-white">
                            {slot.venueBuilding}, Room {slot.venueRoom}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
