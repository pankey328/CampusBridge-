import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentProfile, updateStudentProfile } from "../../redux/profileSlice";
import api from "../../services/api";
import toast from "react-hot-toast";
import { 
  UserCircle, 
  Briefcase, 
  GraduationCap, 
  Phone, 
  Link, 
  FileText,
  ExternalLink
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
    const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
    if (file.type !== "application/pdf" && fileExt !== "pdf") {
      toast.error("Only PDF format is allowed.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    toast.success("Resume PDF attached! It will be saved when you click Save Changes.");
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
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        finalResumeUrl = response.data.url;
        setUploadingResume(false);
      }

      await dispatch(updateStudentProfile({ ...formData, resumeUrl: finalResumeUrl })).unwrap();
      setFormData(prev => ({ ...prev, resumeUrl: finalResumeUrl }));
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
        <div className="w-12 h-12 border-4 border-[#00ED64] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn w-full pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your personal details, resume links, and skills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Academic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0A192F] rounded-2xl border border-gray-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#00ED64]/10 text-[#00ED64] text-xs font-bold px-3 py-1 rounded-bl-lg border-b border-l border-[#00ED64]/20">
              Managed by TPO
            </div>
            
            <div className="flex items-center space-x-4 mb-6 pt-2">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#00ED64] to-[#00ED64]/50 flex items-center justify-center text-[#0A192F] text-2xl font-bold">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile?.firstName} {profile?.lastName}</h2>
                <p className="text-gray-400 text-sm">{profile?.userId?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Roll Number</label>
                <div className="flex items-center space-x-2 text-gray-300 mt-1 bg-[#112240] p-3 rounded-lg border border-gray-800">
                  <GraduationCap className="h-5 w-5 text-gray-500" />
                  <span className="font-mono">{profile?.rollNumber}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Branch & Passout</label>
                <div className="flex items-center space-x-2 text-gray-300 mt-1 bg-[#112240] p-3 rounded-lg border border-gray-800">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                  <span>{profile?.branch} ({profile?.passoutYear})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">CGPA</label>
                  <div className="text-lg font-bold text-[#00ED64] mt-1 bg-[#112240] p-3 rounded-lg border border-gray-800 text-center">
                    {profile?.cgpa?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Backlogs</label>
                  <div className={`text-lg font-bold mt-1 bg-[#112240] p-3 rounded-lg border border-gray-800 text-center ${profile?.activeBacklogs > 0 ? 'text-red-400' : 'text-white'}`}>
                    {profile?.activeBacklogs || "0"}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-6 text-center italic">
              Academic details can only be updated by the placement cell.
            </p>
          </div>
        </div>

        {/* Right Column: Editable Personal Info */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-[#0A192F] rounded-2xl border border-gray-800 p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <UserCircle className="h-6 w-6 text-[#00ED64] mr-2" />
              Personal & Portfolio Details
            </h2>

            <div className="space-y-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 bg-[#112240] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Profile URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className="w-full pl-10 bg-[#112240] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Profile URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      className="w-full pl-10 bg-[#112240] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Resume */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Resume (PDF only, Max 2MB)</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#112240] p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="h-6 w-6 text-gray-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      {formData.resumeUrl ? (
                        <a
                          href={formData.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#00ED64] hover:underline text-sm font-semibold truncate block flex items-center gap-1.5"
                        >
                          <span>View Current Resume (PDF)</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">No resume uploaded yet.</p>
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
                      className="w-full sm:w-auto px-4 py-2 bg-[#0A192F] hover:bg-[#1a3360] text-gray-300 rounded-lg text-xs font-bold border border-gray-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>{resumeFile ? `Attached: ${resumeFile.name}` : "Choose File"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills (Comma separated)</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[#112240] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors resize-none"
                  placeholder="React, Node.js, Python, MongoDB..."
                ></textarea>
              </div>

            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#00ED64] text-[#0A192F] px-8 py-3 rounded-xl font-bold hover:bg-[#00c954] transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
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
