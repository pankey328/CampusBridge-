import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentProfile,
  updateStudentProfile,
} from "../../redux/profileSlice";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  UserCircle,
  Briefcase,
  GraduationCap,
  Phone,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { profile, isLoading: loading } = useSelector((state) => state.profile);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    linkedinUrl: "",
    githubUrl: "",
    resumeUrl: "",
    skills: "",
  });

  useEffect(() => {
    if (!profile) {
      dispatch(fetchStudentProfile());
    }
  }, [profile, dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        resumeUrl: profile.resumeUrl || "",
        skills: profile.skills ? profile.skills.join(", ") : "",
      });
    }
  }, [profile]);

  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const handleResumeSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit.");
      e.target.value = "";
      return;
    }
    const fileExt = file.name ? file.name.split(".").pop().toLowerCase() : "";
    if (file.type !== "application/pdf" && fileExt !== "pdf") {
      toast.error("Only PDF format is allowed.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    toast.success(
      "Resume PDF attached! It will be saved when you click Save Changes.",
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalResumeUrl = formData.resumeUrl;

      if (resumeFile) {
        setUploadingResume(true);
        const uploadData = new FormData();
        uploadData.append("resume", resumeFile);
        const response = await api.post("/upload/resume", uploadData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        finalResumeUrl = response.data.url;
        setUploadingResume(false);
      }

      await dispatch(
        updateStudentProfile({ ...formData, resumeUrl: finalResumeUrl }),
      ).unwrap();
      setFormData((prev) => ({ ...prev, resumeUrl: finalResumeUrl }));
      setResumeFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-t-4 border-[#034D35] dark:border-[#B6F596] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white mb-2 tracking-tight">
          My Profile
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Manage your personal details, resume links, and skills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Academic Info (Read-only) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-6 md:p-8 shadow-sm relative overflow-hidden transition-colors duration-300">
            {/* Admin Managed Badge */}
            <div className="absolute top-0 right-0 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} /> Managed by TPO
              </span>
            </div>

            <div className="flex items-center space-x-4 mb-8 pt-4">
              <div className="h-16 w-16 rounded-[20px] bg-[#034D35] text-[#B6F596] dark:bg-[#B6F596] dark:text-[#034D35] flex items-center justify-center text-2xl font-extrabold shadow-sm">
                {profile?.firstName?.charAt(0)}
                {profile?.lastName?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#121212] dark:text-white leading-tight">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-0.5">
                  {profile?.userId?.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-100 dark:border-slate-700/50">
                <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1 block">
                  Roll Number
                </label>
                <div className="flex items-center space-x-2 text-[#121212] dark:text-white font-bold">
                  <GraduationCap className="h-5 w-5 text-[#034D35] dark:text-[#B6F596]" />
                  <span className="font-mono text-sm tracking-wide">
                    {profile?.rollNumber}
                  </span>
                </div>
              </div>

              <div className="bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-100 dark:border-slate-700/50">
                <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1 block">
                  Branch & Passout
                </label>
                <div className="flex items-center space-x-2 text-[#121212] dark:text-white font-bold text-sm">
                  <Briefcase className="h-5 w-5 text-[#034D35] dark:text-[#B6F596]" />
                  <span>
                    {profile?.branch} ({profile?.passoutYear})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-100 dark:border-slate-700/50 flex flex-col justify-center">
                  <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
                    CGPA
                  </label>
                  <div className="text-xl font-extrabold text-[#034D35] dark:text-[#B6F596]">
                    {profile?.cgpa?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div className="bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-100 dark:border-slate-700/50 flex flex-col justify-center">
                  <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Backlogs
                  </label>
                  <div
                    className={`text-xl font-extrabold ${profile?.activeBacklogs > 0 ? "text-red-500 dark:text-red-400" : "text-[#121212] dark:text-white"}`}
                  >
                    {profile?.activeBacklogs || "0"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-6 text-center font-medium">
              Academic details are locked and managed by the placement cell.
            </p>
          </div>
        </div>

        {/* Right Column: Editable Personal Info */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm transition-colors duration-300"
          >
            <h2 className="text-xl font-extrabold text-[#121212] dark:text-white mb-6 flex items-center">
              <UserCircle className="h-6 w-6 text-[#034D35] dark:text-[#B6F596] mr-2.5" />
              Personal & Portfolio Details
            </h2>

            <div className="space-y-5">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] focus:border-[#034D35] dark:focus:border-[#B6F596] transition-all text-sm font-medium"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Social Links Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    LinkedIn URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] focus:border-[#034D35] dark:focus:border-[#B6F596] transition-all text-sm font-medium"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    GitHub URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] focus:border-[#034D35] dark:focus:border-[#B6F596] transition-all text-sm font-medium"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Resume Upload Box */}
              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                  Upload Resume (PDF, Max 2MB)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-[14px] shadow-sm border border-gray-100 dark:border-slate-700 shrink-0">
                      <FileText className="h-6 w-6 text-[#034D35] dark:text-[#B6F596]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {formData.resumeUrl ? (
                        <a
                          href={formData.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#121212] dark:text-white hover:text-[#034D35] dark:hover:text-[#B6F596] text-sm font-bold truncate flex items-center gap-1.5 transition-colors"
                        >
                          <span>View Current Resume</span>
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          No resume uploaded yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleResumeSelect}
                      disabled={uploadingResume || saving}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={uploadingResume || saving}
                      className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#121212] dark:text-white rounded-full text-xs font-bold border border-gray-200 dark:border-slate-600 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <span>
                        {resumeFile
                          ? `Attached: ${resumeFile.name.substring(0, 15)}...`
                          : "Choose File"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                  Skills (Comma separated)
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] focus:border-[#034D35] dark:focus:border-[#B6F596] transition-all text-sm font-medium resize-none"
                  placeholder="React, Node.js, Python, System Design..."
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] px-8 py-3.5 rounded-full font-bold transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md text-sm"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
