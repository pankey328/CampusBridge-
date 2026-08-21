import React, { useState, useEffect } from 'react';
import { User, Building2, Phone, Briefcase, Link as LinkIcon, Save, Image as ImageIcon, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const HRProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    designation: '',
    phone: '',
    linkedinUrl: '',
    logoUrl: '',
    website: '',
    industry: '',
    gstin: '',
    address: ''
  });
  const [companyName, setCompanyName] = useState('');

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/hr/profile', getAuthHeader());
      const { hrProfile, company } = response.data;

      setCompanyName(hrProfile.companyName);
      setFormData({
        designation: hrProfile.designation || '',
        phone: hrProfile.phone || '',
        linkedinUrl: hrProfile.linkedinUrl || '',
        logoUrl: company.logoUrl || '',
        website: company.website || '',
        industry: company.industry || '',
        gstin: company.gstin || '',
        address: company.address || ''
      });
    } catch (error) {
      toast.error('Failed to load profile data');
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
    const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
    const isImage = file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png" ||
                    fileExt === "jpg" || fileExt === "jpeg" || fileExt === "png";
    if (!isImage) {
      toast.error("Only JPG, JPEG, and PNG logos are allowed.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    toast.success("Logo image selected! It will be saved when you click Save Profile.");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        finalLogoUrl = response.data.url;
        setUploadingLogo(false);
      }

      const payload = { ...formData, logoUrl: finalLogoUrl };
      await api.put('/hr/profile', payload, getAuthHeader());
      setFormData(prev => ({ ...prev, logoUrl: finalLogoUrl }));
      setLogoFile(null);
      setLogoPreview(null);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in flex-1">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">My Profile</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your personal details and company branding.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6 flex-1 min-h-0 pb-2">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Personal Details Section */}
          <div className="glass-panel rounded-2xl border border-[var(--color-border)] relative overflow-hidden flex flex-col h-full group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-brand-primary)]/10 transition-all pointer-events-none"></div>
          
          <div className="bg-[var(--color-bg-primary)]/50 backdrop-blur-sm px-6 py-5 border-b border-[var(--color-border)] flex items-center relative z-10">
            <div className="p-2 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border)] mr-4">
              <User className="text-[var(--color-brand-primary)]" size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Recruiter Details</h2>
          </div>
          <div className="p-6 flex flex-col space-y-6 flex-1 relative z-10">

            <div className="space-y-2 group/input">
              <label className="text-sm text-[var(--color-text-secondary)] font-medium group-focus-within/input:text-[var(--color-brand-primary)] transition-colors">Designation</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within/input:text-[var(--color-brand-primary)] transition-colors" size={18} />
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  className="w-full bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50 transition-all focus:bg-[var(--color-bg-primary)] focus:shadow-[0_0_15px_rgba(0,237,100,0.1)]"
                  placeholder="e.g. Senior Talent Acquisition"
                />
              </div>
            </div>

            <div className="space-y-2 group/input">
              <label className="text-sm text-[var(--color-text-secondary)] font-medium group-focus-within/input:text-[var(--color-brand-primary)] transition-colors">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within/input:text-[var(--color-brand-primary)] transition-colors" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50 transition-all focus:bg-[var(--color-bg-primary)] focus:shadow-[0_0_15px_rgba(0,237,100,0.1)]"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="space-y-2 group/input">
              <label className="text-sm text-[var(--color-text-secondary)] font-medium group-focus-within/input:text-[var(--color-brand-primary)] transition-colors">LinkedIn Profile URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within/input:text-[var(--color-brand-primary)] transition-colors" size={18} />
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50 transition-all focus:bg-[var(--color-bg-primary)] focus:shadow-[0_0_15px_rgba(0,237,100,0.1)]"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

          </div>
        </div>

          {/* Company Details Section */}
          <div className="glass-panel rounded-2xl border border-[var(--color-border)] relative overflow-hidden flex flex-col h-full group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all pointer-events-none"></div>

          <div className="bg-[var(--color-bg-primary)]/50 backdrop-blur-sm px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between relative z-10">
            <div className="flex items-center">
              <div className="p-2 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border)] mr-4">
                <Building2 className="text-purple-400" size={20} />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Company Information</h2>
            </div>
            <span className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
              {companyName}
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

            <div className="space-y-2 group/input">
              <label className="text-sm text-[var(--color-text-secondary)] font-medium group-focus-within/input:text-[var(--color-brand-primary)] transition-colors">Company Logo (JPG/PNG, Max 1MB)</label>
              <div className="flex items-center gap-4 bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-lg p-3">
                <div className="w-12 h-12 rounded bg-white border border-[var(--color-border)] flex items-center justify-center shrink-0 overflow-hidden">
                  {logoPreview || formData.logoUrl ? (
                    <img src={logoPreview || formData.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={20} className="text-gray-400" />
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
                    className="px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)] text-gray-300 rounded border border-[var(--color-border)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{logoFile ? `Selected: ${logoFile.name}` : (formData.logoUrl ? "Change Logo" : "Upload Logo")}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 group/input">
              <label className="text-sm text-[var(--color-text-secondary)] font-medium group-focus-within/input:text-[var(--color-brand-primary)] transition-colors">Company Website</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within/input:text-[var(--color-brand-primary)] transition-colors" size={18} />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50 transition-all focus:bg-[var(--color-bg-primary)] focus:shadow-[0_0_15px_rgba(0,237,100,0.1)]"
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            <div className="space-y-2 group/input">
              <label className="text-sm text-[var(--color-text-secondary)] font-medium group-focus-within/input:text-[var(--color-brand-primary)] transition-colors">Industry</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within/input:text-[var(--color-brand-primary)] transition-colors" size={18} />
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50 transition-all focus:bg-[var(--color-bg-primary)] focus:shadow-[0_0_15px_rgba(0,237,100,0.1)]"
                  placeholder="e.g. Information Technology"
                />
              </div>
            </div>

            <div className="space-y-2 group/input">
              <label className="text-sm text-[var(--color-text-secondary)] font-medium group-focus-within/input:text-[var(--color-brand-primary)] transition-colors">GSTIN (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] group-focus-within/input:text-[var(--color-brand-primary)] transition-colors" size={18} />
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50 transition-all focus:bg-[var(--color-bg-primary)] focus:shadow-[0_0_15px_rgba(0,237,100,0.1)]"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2 group/input">
              <label className="text-sm text-[var(--color-text-secondary)] font-medium group-focus-within/input:text-[var(--color-brand-primary)] transition-colors">Corporate Headquarters Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-[var(--color-text-secondary)] group-focus-within/input:text-[var(--color-brand-primary)] transition-colors" size={18} />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)]/50 transition-all focus:bg-[var(--color-bg-primary)] focus:shadow-[0_0_15px_rgba(0,237,100,0.1)] resize-none"
                  placeholder="Enter full company address..."
                ></textarea>
              </div>
            </div>

          </div>
        </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 shrink-0">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-[#001E2B] font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(0,237,100,0.2)] hover:shadow-[0_0_30px_rgba(0,237,100,0.4)] transition-all flex items-center disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#001E2B] mr-2"></div>
            ) : (
              <Save size={20} className="mr-2" />
            )}
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default HRProfile;
