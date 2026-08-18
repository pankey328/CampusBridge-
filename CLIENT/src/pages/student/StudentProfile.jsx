import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { 
  UserCircle, 
  Briefcase, 
  GraduationCap, 
  Phone, 
  Link, 
  FileText 
} from "lucide-react";

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    phone: "",
    linkedinUrl: "",
    githubUrl: "",
    resumeUrl: "",
    skills: "",
  });

  const fetchProfile = async () => {
    try {
      const response = await api.get("/student/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = response.data.data;
      setProfile(data);
      setFormData({
        phone: data.phone || "",
        linkedinUrl: data.linkedinUrl || "",
        githubUrl: data.githubUrl || "",
        resumeUrl: data.resumeUrl || "",
        skills: data.skills ? data.skills.join(", ") : "",
      });
    } catch (error) {
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/student/profile", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-[#00ED64] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your personal information and portfolio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Academic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#112240] rounded-2xl border border-gray-800 p-6 shadow-xl relative overflow-hidden">
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
                <div className="flex items-center space-x-2 text-gray-300 mt-1 bg-[#0A192F] p-3 rounded-lg border border-gray-800">
                  <GraduationCap className="h-5 w-5 text-gray-500" />
                  <span className="font-mono">{profile?.rollNumber}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Branch & Passout</label>
                <div className="flex items-center space-x-2 text-gray-300 mt-1 bg-[#0A192F] p-3 rounded-lg border border-gray-800">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                  <span>{profile?.branch} ({profile?.passoutYear})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">CGPA</label>
                  <div className="text-lg font-bold text-white mt-1 bg-[#0A192F] p-3 rounded-lg border border-gray-800 text-center">
                    {profile?.cgpa?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Backlogs</label>
                  <div className={`text-lg font-bold mt-1 bg-[#0A192F] p-3 rounded-lg border border-gray-800 text-center ${profile?.activeBacklogs > 0 ? 'text-red-400' : 'text-white'}`}>
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
          <form onSubmit={handleSubmit} className="bg-[#112240] rounded-2xl border border-gray-800 p-6 sm:p-8 shadow-xl">
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
                    className="w-full pl-10 bg-[#0A192F] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors"
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
                      className="w-full pl-10 bg-[#0A192F] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors"
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
                      className="w-full pl-10 bg-[#0A192F] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>

              {/* Resume */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resume Link (Google Drive / PDF Link)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="url"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    className="w-full pl-10 bg-[#0A192F] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Ensure the link is publicly accessible so recruiters can view it.</p>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills (Comma separated)</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[#0A192F] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-colors resize-none"
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
