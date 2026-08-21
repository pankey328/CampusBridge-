import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile } from '../../redux/profileSlice';
import { 
  Bot, Briefcase, CheckCircle2, Clock, FileText, Building2, 
  MapPin, DollarSign, Shield, ExternalLink, ArrowUpRight, 
  ChevronRight, Sparkles, Code2, Database, Cpu, Terminal, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, isLoading: isProfileLoading } = useSelector((state) => state.profile);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      dispatch(fetchStudentProfile());

      const driveRes = await api.get('/student/drives', getAuthHeader());
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

  const eligibleDrives = drives.filter(d => d.isEligible && !d.isApplied);

  const handleStartPractice = () => {
    navigate('/student/practice');
  };

  const isScreenLoading = loading || isProfileLoading;

  if (isScreenLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ED64]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Welcome Back & AI Technical Mock Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Card: Welcome Back Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] border border-gray-800 p-6 md:p-7 shadow-xl flex flex-col justify-between space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ED64]/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="bg-[#00ED64]/10 text-[#00ED64] border border-[#00ED64]/20 text-xs px-3 py-0.5 rounded-full font-semibold">
                Student Portal
              </span>
              {profile?.isLocked ? (
                <span className="bg-red-900/40 text-red-400 border border-red-800/50 text-xs px-3 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Shield size={12} /> Profile Locked
                </span>
              ) : (
                <span className="bg-[#00ED64]/10 text-[#00ED64] border border-[#00ED64]/20 text-xs px-3 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Eligible to Apply
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-[#00ED64]">{profile?.firstName || 'Student'}</span>!
            </h1>

            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              Track active campus placement drives, monitor application statuses, and update your academic portfolio.
            </p>

            {/* Quick Profile Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {profile?.branch && (
                <span className="bg-[#0A192F] text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-800 font-medium">
                  Branch: <strong className="text-white">{profile.branch}</strong>
                </span>
              )}
              {profile?.cgpa !== undefined && (
                <span className="bg-[#0A192F] text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-800 font-medium">
                  CGPA: <strong className="text-[#00ED64]">{profile.cgpa}</strong>
                </span>
              )}
              {profile?.rollNumber && (
                <span className="bg-[#0A192F] text-gray-300 text-xs px-2.5 py-1 rounded-lg border border-gray-800 font-medium">
                  Roll No: <strong className="text-white">{profile.rollNumber}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/student/drives')}
              className="bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#00ED64]/10 text-xs flex items-center gap-1.5 group"
            >
              <Briefcase size={16} />
              <span>Explore Job Drives</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/student/profile')}
              className="bg-[#112240] hover:bg-[#1a3360] text-gray-300 hover:text-white px-4 py-2.5 rounded-xl transition-all border border-gray-800 font-semibold text-xs flex items-center gap-1.5"
            >
              <FileText size={15} />
              <span>Update Profile</span>
            </button>
          </div>
        </div>

        {/* Right Card: AI Technical Mock Practice Banner */}
        <div className="bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] p-6 md:p-7 rounded-2xl border-2 border-[#00ED64]/30 relative overflow-hidden group shadow-2xl flex flex-col justify-between space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ED64]/15 rounded-full blur-[90px] pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-[#00ED64]/20 p-2.5 rounded-xl border border-[#00ED64]/40 text-[#00ED64] shadow-md shadow-[#00ED64]/10">
                <Bot size={24} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00ED64] bg-[#00ED64]/10 px-2 py-0.5 rounded border border-[#00ED64]/20">
                  Adaptive AI Interview
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                  AI Technical Mock Practice <Sparkles size={16} className="text-yellow-400 animate-bounce" />
                </h2>
              </div>
            </div>

            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              Sharpen your technical interview readiness with real-time AI questions tailored automatically to your engineering branch and listed skill set.
            </p>

            {/* Dynamic Skills Scope */}
            <div className="pt-1 space-y-1.5">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Your Practice Scope:</p>
              <div className="flex flex-wrap gap-1.5">
                {profile?.branch && (
                  <span className="bg-purple-950/50 text-purple-300 border border-purple-800/60 px-2.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Cpu size={13} /> {profile.branch} Core
                  </span>
                )}
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="bg-[#0A192F] text-gray-200 border border-gray-700 px-2.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Code2 size={13} className="text-[#00ED64]" /> {skill}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="bg-[#0A192F] text-gray-200 border border-gray-700 px-2.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Code2 size={13} className="text-[#00ED64]" /> DSA
                    </span>
                    <span className="bg-[#0A192F] text-gray-200 border border-gray-700 px-2.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Database size={13} className="text-yellow-400" /> DBMS & SQL
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-800/80">
            <button
              onClick={handleStartPractice}
              className="w-full sm:w-auto bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-extrabold py-3 px-6 rounded-xl transition-all shadow-xl shadow-[#00ED64]/20 flex items-center justify-center text-xs gap-2 group"
            >
              <Sparkles size={16} />
              <span>Start AI Mock Interview</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-[11px] text-gray-400 font-medium">Instant AI evaluation & feedback</span>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Job Drives */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Job Drives Preview */}
          <div className="bg-[#0A192F] p-6 rounded-2xl border border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Active Placement Drives</h3>
                <p className="text-xs text-gray-400">Explore open hiring drives and check your eligibility</p>
              </div>
              <button
                onClick={() => navigate('/student/drives')}
                className="text-xs font-semibold text-[#00ED64] hover:underline flex items-center gap-1"
              >
                <span>View All Drives ({drives.length})</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {drives.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-[#112240]/50 rounded-xl border border-gray-800/50">
                <Building2 size={44} className="mx-auto mb-3 opacity-30 text-gray-400" />
                <p className="text-sm font-medium">No job drives are currently open.</p>
                <p className="text-xs text-gray-500 mt-1">Check back later for new placement postings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {drives.slice(0, 4).map((drive) => (
                  <div
                    key={drive._id}
                    className="bg-[#112240] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-base">{drive.title}</h4>
                        {drive.isApplied ? (
                          <span className="bg-[#00ED64]/10 text-[#00ED64] text-[10px] font-bold px-2 py-0.5 rounded border border-[#00ED64]/20">
                            Applied
                          </span>
                        ) : drive.isEligible ? (
                          <span className="bg-blue-900/30 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-800/50">
                            Eligible
                          </span>
                        ) : (
                          <span className="bg-gray-800 text-gray-400 text-[10px] font-medium px-2 py-0.5 rounded">
                            Not Eligible
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#00ED64] font-medium">{drive.companyId?.name || 'Partner Company'}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                        {drive.packageLPA && (
                          <span className="flex items-center gap-1">
                            <DollarSign size={13} className="text-yellow-400" />
                            <strong>{drive.packageLPA} LPA</strong>
                          </span>
                        )}
                        {drive.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-gray-500" />
                            {drive.location}
                          </span>
                        )}
                        {drive.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-gray-500" />
                            Ends: {new Date(drive.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/student/drives')}
                      className="self-start sm:self-center px-4 py-2 bg-[#0A192F] hover:bg-[#1a3360] text-gray-200 hover:text-white border border-gray-700 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Placement Readiness Checklist */}
        <div className="space-y-6">

          {/* Placement Readiness Checklist */}
          <div className="bg-[#0A192F] p-6 rounded-2xl border border-gray-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-white">Placement Readiness</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#112240] border border-gray-800">
                <span className="text-gray-300 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00ED64]" /> Academic Details Verified
                </span>
                <span className="text-gray-400 font-mono text-[11px]">Completed</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#112240] border border-gray-800">
                <span className="text-gray-300 flex items-center gap-2">
                  {profile?.resumeUrl ? (
                    <CheckCircle2 size={16} className="text-[#00ED64]" />
                  ) : (
                    <AlertCircle size={16} className="text-yellow-400" />
                  )}
                  Resume Uploaded
                </span>
                {profile?.resumeUrl ? (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00ED64] hover:underline text-[11px] flex items-center gap-1 font-medium"
                  >
                    <span>View</span>
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <button
                    onClick={() => navigate('/student/profile')}
                    className="text-yellow-400 hover:underline text-[11px] font-bold"
                  >
                    Upload Now
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#112240] border border-gray-800">
                <span className="text-gray-300 flex items-center gap-2">
                  {profile?.skills && profile.skills.length > 0 ? (
                    <CheckCircle2 size={16} className="text-[#00ED64]" />
                  ) : (
                    <AlertCircle size={16} className="text-yellow-400" />
                  )}
                  Skills Listed ({profile?.skills?.length || 0})
                </span>
                <button
                  onClick={() => navigate('/student/profile')}
                  className="text-gray-400 hover:text-white text-[11px]"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#112240] border border-gray-800">
                <span className="text-gray-300 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00ED64]" /> Application Access
                </span>
                <span className={`text-[11px] font-bold ${profile?.isLocked ? 'text-red-400' : 'text-[#00ED64]'}`}>
                  {profile?.isLocked ? 'Locked' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Eligible Metrics Card */}
          <div className="bg-[#0A192F] p-5 rounded-2xl border border-gray-800 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Eligible Open Drives</p>
              <h3 className="text-3xl font-bold text-yellow-400">{eligibleDrives.length}</h3>
              <p className="text-[11px] text-gray-500 mt-1">Ready for application submissions</p>
            </div>
            <div className="p-3.5 bg-yellow-900/20 text-yellow-400 rounded-xl border border-yellow-800/40">
              <Building2 size={24} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
