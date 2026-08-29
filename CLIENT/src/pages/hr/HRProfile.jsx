import React, { useState, useEffect } from "react";
import {
  User,
  Building2,
  Phone,
  Briefcase,
  Link as LinkIcon,
  Save,
  Image as ImageIcon,
  MapPin,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const HRProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    designation: "",
    phone: "",
    linkedinUrl: "",
    logoUrl: "",
    website: "",
    industry: "",
    gstin: "",
    address: "",
  });
  const [companyName, setCompanyName] = useState("");

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/hr/profile", getAuthHeader());
      const { hrProfile, company } = response.data;

      setCompanyName(hrProfile.companyName);
      setFormData({
        designation: hrProfile.designation || "",
        phone: hrProfile.phone || "",
        linkedinUrl: hrProfile.linkedinUrl || "",
        logoUrl: company.logoUrl || "",
        website: company.website || "",
        industry: company.industry || "",
        gstin: company.gstin || "",
        address: company.address || "",
      });
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Logo file size exceeds 1MB limit.");
      return;
    }
    const fileExt = file.name ? file.name.split(".").pop().toLowerCase() : "";
    const isImage =
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png" ||
      fileExt === "jpg" ||
      fileExt === "jpeg" ||
      fileExt === "png";
    if (!isImage) {
      toast.error("Only JPG, JPEG, and PNG logos are allowed.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    toast.success("Logo image selected! Save Profile to confirm.");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalLogoUrl = formData.logoUrl;

      if (logoFile) {
        setUploadingLogo(true);
        const uploadData = new FormData();
        uploadData.append("logo", logoFile);
        const response = await api.post("/upload/logo", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        finalLogoUrl = response.data.url;
        setUploadingLogo(false);
      }

      const payload = { ...formData, logoUrl: finalLogoUrl };
      await api.put("/hr/profile", payload, getAuthHeader());
      setFormData((prev) => ({ ...prev, logoUrl: finalLogoUrl }));
      setLogoFile(null);
      setLogoPreview(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight mb-2">
          My Profile
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Manage your personal details and company branding.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Details Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden transition-colors duration-300">
            <div className="bg-[#F9F7F1] dark:bg-slate-900 px-8 py-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-4 transition-colors duration-300">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-[14px] border border-gray-200 dark:border-slate-700 shadow-sm">
                <User
                  className="text-[#034D35] dark:text-[#B6F596]"
                  size={24}
                />
              </div>
              <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
                Recruiter Details
              </h2>
            </div>

            <div className="p-8 flex flex-col space-y-6 flex-1">
              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                  Designation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all shadow-sm"
                    placeholder="e.g. Senior Talent Acquisition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all shadow-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                  LinkedIn Profile URL
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
                    className="w-full pl-11 pr-4 py-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all shadow-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden transition-colors duration-300">
            <div className="bg-[#F9F7F1] dark:bg-slate-900 px-8 py-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-[14px] border border-gray-200 dark:border-slate-700 shadow-sm">
                  <Building2
                    className="text-[#034D35] dark:text-[#B6F596]"
                    size={24}
                  />
                </div>
                <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
                  Company Info
                </h2>
              </div>
              <span className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-full font-bold shadow-sm">
                {companyName}
              </span>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                  Company Logo (JPG/PNG, Max 1MB)
                </label>
                <div className="flex items-center gap-5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-[20px] p-4 shadow-sm">
                  <div className="w-16 h-16 rounded-[14px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm p-1.5">
                    {logoPreview || formData.logoUrl ? (
                      <img
                        src={logoPreview || formData.logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleLogoSelect}
                      disabled={uploadingLogo || saving}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={uploadingLogo || saving}
                      className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#121212] dark:text-white rounded-full border border-gray-200 dark:border-slate-600 text-xs font-bold shadow-sm transition-colors w-full sm:w-auto"
                    >
                      {logoFile
                        ? `Selected: ${logoFile.name.substring(0, 15)}...`
                        : formData.logoUrl
                          ? "Change Logo"
                          : "Upload Logo"}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                  Company Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all shadow-sm"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                  Industry
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all shadow-sm"
                    placeholder="e.g. Information Technology"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                  GSTIN (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all shadow-sm"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                  Corporate Headquarters Address
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full pl-11 pr-4 py-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all shadow-sm resize-none"
                    placeholder="Enter full company address..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-3.5 px-8 rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-current"></div>
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HRProfile;
