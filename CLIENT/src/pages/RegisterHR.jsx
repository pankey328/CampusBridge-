import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import Logo from "./Logo";

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
    <div className="min-h-screen lg:h-screen flex bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 bg-[#B6F596] dark:bg-[#012a1d] relative items-center justify-center p-8 xl:p-12 overflow-hidden h-full">
        <svg
          className="absolute inset-0 w-full h-full text-[#034D35]/10 dark:text-[#B6F596]/10"
          fill="none"
        >
          <path
            d="M 0 500 C 300 500, 300 200, 600 200"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M -100 600 C 400 600, 400 300, 800 300"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/40 dark:bg-white/10 border border-[#034D35]/10 dark:border-white/10 rounded-full px-4 py-1.5 text-xs text-[#034D35] dark:text-[#9ad97a] font-bold uppercase tracking-wider">
            <ShieldCheck size={16} />
            <span>Corporate Partnership</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-[#034D35] dark:text-white tracking-tight leading-tight">
            Connect directly with verified student talent.
          </h1>

          <p className="text-[#034D35]/80 dark:text-gray-300 text-base font-medium leading-relaxed">
            CampusBridge empowers recruitment leaders to post job drives, screen
            pre-qualified candidates, automate schedule dispatches, and conduct
            structured interviews.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-[#034D35] dark:text-[#B6F596]"
              />
              <span className="text-sm font-semibold text-[#034D35] dark:text-gray-200">
                Automated eligibility screening
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-[#034D35] dark:text-[#B6F596]"
              />
              <span className="text-sm font-semibold text-[#034D35] dark:text-gray-200">
                Seamless video interview scheduling
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-[#034D35] dark:text-[#B6F596]"
              />
              <span className="text-sm font-semibold text-[#034D35] dark:text-gray-200">
                Direct integration with Placement Officers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-10 h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[500px]">
          {/* Logo */}
          <div className="mb-5">
            <Logo className="w-[160px] sm:w-[180px] h-auto text-[#049669] dark:text-white transition-colors duration-300" />
          </div>

          <h2 className="text-2xl font-bold text-[#121212] dark:text-white mb-1">
            Register your company
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 font-medium">
            Fill in your recruiter and organization details below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recruiter Details Group */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#121212] dark:text-white pb-1.5 border-b border-gray-200 dark:border-slate-700">
                1. Recruiter Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="hr@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1">
                    Designation / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="Talent Acquisition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="linkedin.com/in/..."
                  />
                </div>
              </div>
            </div>

            {/* Company Details Group */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#121212] dark:text-white pb-1.5 border-b border-gray-200 dark:border-slate-700">
                2. Organization Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="Acme Corp"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1">
                    Industry Sector <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="industry"
                    required
                    value={formData.industry}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="Technology / AI"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="Optional ID"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-full text-sm font-bold !text-white bg-[#121212] hover:bg-black dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] focus:outline-none transition-all disabled:opacity-50 shadow-md mt-4"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white dark:border-[#034D35] border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Request...</span>
                </div>
              ) : (
                "Submit Partnership Request"
              )}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-center text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#121212] dark:text-white font-semibold underline underline-offset-4 hover:text-indigo-600 transition-colors"
              >
                Sign in here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterHR;
