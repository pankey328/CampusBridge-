
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Building2, User, Mail, Phone, Briefcase, Link as LinkIcon, FileText } from 'lucide-react';

const RegisterHR = () => {
  const [formData, setFormData] = useState({
    email: "",
    companyName: "",
    designation: "",
    phone: "",
    linkedinUrl: "",
    gstin: "",
    website: "",
    industry: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/hr/register", formData);
      toast.success(
        response.data.message ||
          "Registration successful! Please wait for TPO approval.",
        { duration: 5000 },
      );
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please check your details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-[var(--color-bg-primary)] transition-colors duration-300">
      <div className="w-full max-w-2xl glass-panel rounded-2xl p-8 shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-input)] mb-4 border border-[var(--color-border)] shadow-sm">
            <Building2 className="w-8 h-8 text-[var(--color-brand-primary)]" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Corporate Partner Registration
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Join CampusBridge to hire top talent from our institution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                Recruiter Details
              </h3>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="email"
                    name="email"
                    required
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
                    placeholder="hr@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Designation
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    name="designation"
                    required
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
                    placeholder="e.g. Talent Acquisition Lead"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="tel"
                    name="phone"
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="url"
                    name="linkedinUrl"
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                Company Details
              </h3>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    name="companyName"
                    required
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Industry
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    name="industry"
                    required
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
                    placeholder="e.g. Information Technology"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Company Website
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="url"
                    name="website"
                    required
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
                    placeholder="https://acme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  GSTIN (For Verification)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    name="gstin"
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
                    placeholder="Optional, speeds up approval"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-[#001E2B] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)] transition-all disabled:opacity-50 mt-8"
          >
            {isLoading ? "Submitting Request..." : "Submit Partnership Request"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-bold text-[var(--color-brand-primary)] hover:underline"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterHR
