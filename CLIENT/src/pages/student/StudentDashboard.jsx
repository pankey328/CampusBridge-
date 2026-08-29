import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentProfile } from "../../redux/profileSlice";
import {
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  MapPin,
  DollarSign,
  Shield,
  ExternalLink,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Code2,
  Database,
  Cpu,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, isLoading: isProfileLoading } = useSelector(
    (state) => state.profile,
  );
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      dispatch(fetchStudentProfile());

      const driveRes = await api.get("/student/drives", getAuthHeader());
      if (driveRes.data && driveRes.data.data) {
        setDrives(driveRes.data.data);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const eligibleDrives = drives.filter((d) => d.isEligible && !d.isApplied);

  const handleStartPractice = () => {
    navigate("/student/practice");
  };

  if (loading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Top Section: Welcome & AI Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Card: Welcome Back Banner */}
        <div className="relative rounded-[32px] overflow-hidden bg-[#B6F596] dark:bg-[#012a1d] border border-[#B6F596] dark:border-[#012a1d] p-8 shadow-sm flex flex-col justify-between space-y-6 transition-colors duration-300">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="bg-white/50 dark:bg-white/10 text-[#034D35] dark:text-[#9ad97a] text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
                Student Portal
              </span>
              {profile?.isLocked ? (
                <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} /> Profile Locked
                </span>
              ) : (
                <span className="bg-white/50 dark:bg-white/10 text-[#034D35] dark:text-[#9ad97a] text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Eligible to Apply
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-[#034D35] dark:text-white tracking-tight">
              Welcome back, {profile?.firstName || "Student"}!
            </h1>

            <p className="text-[#034D35]/80 dark:text-gray-300 text-sm md:text-base font-medium leading-relaxed max-w-sm">
              Track active campus placement drives, monitor application
              statuses, and update your academic portfolio.
            </p>

            {/* Quick Profile Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {profile?.branch && (
                <span className="bg-white dark:bg-slate-800 text-[#121212] dark:text-gray-200 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
                  Branch: {profile.branch}
                </span>
              )}
              {profile?.cgpa !== undefined && (
                <span className="bg-white dark:bg-slate-800 text-[#121212] dark:text-gray-200 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
                  CGPA:{" "}
                  <span className="text-[#034D35] dark:text-[#B6F596]">
                    {profile.cgpa}
                  </span>
                </span>
              )}
              {profile?.rollNumber && (
                <span className="bg-white dark:bg-slate-800 text-[#121212] dark:text-gray-200 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
                  Roll No: {profile.rollNumber}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => navigate("/student/drives")}
              className="bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold px-6 py-3 rounded-full transition-all shadow-md text-sm flex items-center gap-2 group"
            >
              <Briefcase size={18} />
              <span>Explore Job Drives</span>
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={() => navigate("/student/profile")}
              className="bg-white hover:bg-gray-50 text-[#121212] dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 px-6 py-3 rounded-full transition-all font-bold text-sm flex items-center gap-2 shadow-sm border border-transparent dark:border-slate-600"
            >
              <FileText size={16} />
              <span>Update Profile</span>
            </button>
          </div>
        </div>

        {/* Right Card: AI Technical Mock Practice Banner */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-6 transition-colors duration-300">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-[#F9F7F1] dark:bg-slate-700 p-3.5 rounded-2xl text-[#034D35] dark:text-[#B6F596]">
                <Bot size={28} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#034D35] dark:text-[#B6F596] bg-[#B6F596]/30 dark:bg-[#034D35]/50 px-3 py-1 rounded-full">
                  Adaptive AI Interview
                </span>
                <h2 className="text-2xl font-extrabold text-[#121212] dark:text-white flex items-center gap-2 mt-2">
                  Technical Mock Practice{" "}
                  <Sparkles size={18} className="text-amber-500" />
                </h2>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">
              Sharpen your technical interview readiness with real-time AI
              questions tailored automatically to your engineering branch and
              listed skill set.
            </p>

            <div className="pt-2 space-y-2.5">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                Your Practice Scope:
              </p>
              <div className="flex flex-wrap gap-2">
                {profile?.branch && (
                  <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Cpu size={14} /> {profile.branch} Core
                  </span>
                )}
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#F9F7F1] dark:bg-slate-700 text-[#121212] dark:text-gray-200 border border-gray-200 dark:border-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
                    >
                      <Code2
                        size={14}
                        className="text-[#034D35] dark:text-[#B6F596]"
                      />{" "}
                      {skill}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="bg-[#F9F7F1] dark:bg-slate-700 text-[#121212] dark:text-gray-200 border border-gray-200 dark:border-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Code2
                        size={14}
                        className="text-[#034D35] dark:text-[#B6F596]"
                      />{" "}
                      DSA
                    </span>
                    <span className="bg-[#F9F7F1] dark:bg-slate-700 text-[#121212] dark:text-gray-200 border border-gray-200 dark:border-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Database size={14} className="text-amber-500" /> DBMS &
                      SQL
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={handleStartPractice}
              className="w-full sm:w-auto bg-[#034D35] hover:bg-[#023b28] !text-[#B6F596] dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-3 px-6 rounded-full transition-all shadow-md flex items-center justify-center text-sm gap-2 group"
            >
              <Sparkles size={18} />
              <span>Start AI Mock Interview</span>
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">
              Instant evaluation
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Drives & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Job Drives */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm space-y-6 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-[#121212] dark:text-white">
                  Active Placement Drives
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                  Explore open hiring drives and check eligibility
                </p>
              </div>
              <button
                onClick={() => navigate("/student/drives")}
                className="text-sm font-bold text-[#034D35] dark:text-[#B6F596] hover:underline flex items-center gap-1 self-start sm:self-center bg-[#B6F596]/20 dark:bg-[#034D35]/30 px-4 py-2 rounded-full"
              >
                <span>View All ({drives.length})</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {drives.length === 0 ? (
              <div className="text-center py-16 bg-[#F9F7F1] dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-700/50">
                <Building2
                  size={48}
                  className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                />
                <p className="text-base font-bold text-[#121212] dark:text-white">
                  No job drives are currently open.
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                  Check back later for new placement postings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {drives.slice(0, 4).map((drive) => (
                  <div
                    key={drive._id}
                    className="bg-[#F9F7F1] dark:bg-slate-900 p-5 rounded-[24px] border border-gray-100 dark:border-slate-700/50 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="font-extrabold text-[#121212] dark:text-white text-lg">
                          {drive.title}
                        </h4>
                        {drive.isApplied ? (
                          <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
                            Applied
                          </span>
                        ) : drive.isEligible ? (
                          <span className="bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] text-xs font-bold px-3 py-1 rounded-full">
                            Eligible
                          </span>
                        ) : (
                          <span className="bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-gray-400 text-xs font-bold px-3 py-1 rounded-full">
                            Not Eligible
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#034D35] dark:text-[#B6F596]">
                        {drive.companyId?.name || "Partner Company"}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400 pt-1">
                        {drive.packageLPA && (
                          <span className="flex items-center gap-1.5">
                            <DollarSign
                              size={16}
                              className="text-[#034D35] dark:text-[#B6F596]"
                            />
                            <strong className="text-[#121212] dark:text-gray-200">
                              {drive.packageLPA} LPA
                            </strong>
                          </span>
                        )}
                        {drive.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={16} /> {drive.location}
                          </span>
                        )}
                        {drive.deadline && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={16} /> Ends:{" "}
                            {new Date(drive.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/student/drives")}
                      className="w-full sm:w-auto self-start sm:self-center px-5 py-2.5 bg-white dark:bg-slate-800 text-[#121212] dark:text-white border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full text-sm font-bold transition-colors shrink-0 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>View Details</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Readiness Checklist & Metrics */}
        <div className="space-y-6">
          {/* Eligible Metrics Card */}
          <div className="bg-[#034D35] p-8 rounded-[32px] shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#B6F596]/20 rounded-2xl flex items-center justify-center mb-6">
                <Building2 size={24} className="text-[#B6F596]" />
              </div>
              <p className="text-[#B6F596] text-xs font-bold uppercase tracking-wider mb-2">
                Eligible Open Drives
              </p>
              <h3 className="text-6xl font-extrabold text-white mb-2">
                {eligibleDrives.length}
              </h3>
              <p className="text-sm font-medium text-gray-300">
                Ready for application submissions right now.
              </p>
            </div>
          </div>

          {/* Placement Readiness Checklist */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm space-y-5 transition-colors duration-300">
            <h3 className="text-xl font-extrabold text-[#121212] dark:text-white">
              Readiness Checklist
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm p-4 rounded-[20px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700/50">
                <span className="text-[#121212] dark:text-gray-200 font-bold flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-[#034D35] dark:text-[#B6F596]"
                  />{" "}
                  Academic Details
                </span>
                <span className="text-gray-500 font-bold text-xs uppercase bg-gray-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Done
                </span>
              </div>

              <div className="flex items-center justify-between text-sm p-4 rounded-[20px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700/50">
                <span className="text-[#121212] dark:text-gray-200 font-bold flex items-center gap-3">
                  {profile?.resumeUrl ? (
                    <CheckCircle2
                      size={20}
                      className="text-[#034D35] dark:text-[#B6F596]"
                    />
                  ) : (
                    <AlertCircle size={20} className="text-amber-500" />
                  )}
                  Resume Uploaded
                </span>
                {profile?.resumeUrl ? (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#034D35] dark:text-[#B6F596] hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    <span>View</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <button
                    onClick={() => navigate("/student/profile")}
                    className="text-amber-600 dark:text-amber-400 hover:underline text-xs font-bold"
                  >
                    Upload Now
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-sm p-4 rounded-[20px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700/50">
                <span className="text-[#121212] dark:text-gray-200 font-bold flex items-center gap-3">
                  {profile?.skills && profile.skills.length > 0 ? (
                    <CheckCircle2
                      size={20}
                      className="text-[#034D35] dark:text-[#B6F596]"
                    />
                  ) : (
                    <AlertCircle size={20} className="text-amber-500" />
                  )}
                  Skills Listed ({profile?.skills?.length || 0})
                </span>
                <button
                  onClick={() => navigate("/student/profile")}
                  className="text-gray-500 hover:text-[#121212] dark:hover:text-white text-xs font-bold underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between text-sm p-4 rounded-[20px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700/50">
                <span className="text-[#121212] dark:text-gray-200 font-bold flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-[#034D35] dark:text-[#B6F596]"
                  />{" "}
                  App Access
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${profile?.isLocked ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" : "bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596]"}`}
                >
                  {profile?.isLocked ? "Locked" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
