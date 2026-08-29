import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Video,
  Sparkles,
} from "lucide-react";
import Logo from "./Logo";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleRegisterHRRedirect = () => {
    navigate("/register-hr");
  };

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col justify-between">
      <div className="bg-[#B6F596] dark:bg-[#012a1d] rounded-bl-[100px] rounded-br-[20px] md:rounded-bl-[140px] md:rounded-br-[40px] relative overflow-hidden transition-colors duration-300">
        {/* Navigation Header */}
        <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Logo className="w-[150px] sm:w-[180px] h-auto text-[#034D35] dark:text-white transition-colors duration-300" />
          </div>

          <div className="flex items-center space-x-4 sm:space-x-5">
            <button
              onClick={handleLoginRedirect}
              className="text-[#034D35] dark:text-gray-200 hover:opacity-70 text-sm font-bold transition-all underline-offset-4 hover:underline"
            >
              Log in
            </button>
            <button
              onClick={handleRegisterHRRedirect}
              className="bg-[#121212] hover:bg-black !text-white dark:bg-white dark:hover:bg-gray-200 dark:!text-slate-900 text-sm font-bold px-5 py-2.5 sm:px-6 rounded-full transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Recruiter Portal</span>
              <span className="sm:hidden">Recruiters</span>
            </button>
          </div>
        </header>

        {/* Hero Banner Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-12 pb-16 md:pt-16 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Headline & CTAs */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/40 dark:bg-white/10 border border-[#034D35]/10 dark:border-white/10 rounded-full px-4 py-1.5 text-xs text-[#034D35] dark:text-[#9ad97a] font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Placement Operating System</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#034D35] dark:text-white">
              Bridge Corporate Hiring with Student Potential.
            </h1>

            <p className="text-[#034D35]/80 dark:text-gray-300 text-lg sm:text-xl leading-relaxed max-w-xl font-medium">
              Standardize institutional placement pipelines. Validate candidate
              eligibility in real time, coordinate with recruiters seamlessly,
              and conduct AI mock technical practices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleLoginRedirect}
                className="bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-4 px-8 rounded-full transition-all shadow-lg flex items-center justify-center gap-2 group text-base"
              >
                <span>Access Portal</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                onClick={handleRegisterHRRedirect}
                className="bg-white hover:bg-gray-50 text-[#121212] dark:bg-transparent dark:hover:bg-white/5 dark:text-white border-2 border-transparent dark:border-white/20 font-bold py-4 px-8 rounded-full transition-all text-base flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Partner with Us</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>

          {/* Right Floating Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-slate-700 space-y-6 relative z-10">
              <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-slate-700/80">
                <div>
                  <h3 className="font-bold text-lg text-[#121212] dark:text-white">
                    Live Pulse
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Campus Analytics
                  </p>
                </div>
                <span className="bg-[#B6F596]/30 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                    <Users
                      size={16}
                      className="text-[#034D35] dark:text-[#B6F596]"
                    />
                    <span>Active Students</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#121212] dark:text-white">
                    450+
                  </div>
                </div>

                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                    <Briefcase
                      size={16}
                      className="text-[#034D35] dark:text-[#B6F596]"
                    />
                    <span>Hiring Drives</span>
                  </div>
                  <div className="text-3xl font-extrabold text-[#121212] dark:text-white">
                    32
                  </div>
                </div>
              </div>

              {/* Feed items */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700/50">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35] dark:text-[#B6F596] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-sm font-bold text-[#121212] dark:text-white truncate">
                      TPO Approved Corporate Drive
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700/50">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Video size={16} />
                    </div>
                    <span className="text-sm font-bold text-[#121212] dark:text-white truncate">
                      Technical Interview Scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Features Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#121212] dark:text-white tracking-tight">
            Designed for Every Stakeholder
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
            Tailored dashboards and tools crafted to eliminate recruitment
            friction for students, recruiters, and placement officers.
          </p>
        </div>

        {/* Brevo Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Corporate Recruiters */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#034D35] text-[#B6F596] flex items-center justify-center">
                  <Briefcase size={26} />
                </div>
                <span className="bg-[#F9F7F1] text-[#121212] dark:bg-slate-700 dark:text-gray-200 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  Recruiters
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#121212] dark:text-white">
                Corporate Partners
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                Post detailed hiring drives, filter applicants by exact branch
                and backlog limits, shortlist candidates in bulk, and dispatch
                instant interview invites.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-[#121212] dark:text-gray-300 pt-6 border-t border-gray-100 dark:border-slate-700/80 font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-[#034D35] dark:text-[#B6F596]"
                />{" "}
                Single-click shortlisting
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-[#034D35] dark:text-[#B6F596]"
                />{" "}
                Video interview scheduling
              </li>
            </ul>
          </div>

          {/* Card 2: Students */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#B6F596] text-[#034D35] flex items-center justify-center">
                  <Users size={26} />
                </div>
                <span className="bg-[#F9F7F1] text-[#121212] dark:bg-slate-700 dark:text-gray-200 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  Students
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#121212] dark:text-white">
                Candidates
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                Check eligibility criteria automatically, apply to live campus
                job drives in one click, host verifiable resumes, and practice
                AI mock interviews.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-[#121212] dark:text-gray-300 pt-6 border-t border-gray-100 dark:border-slate-700/80 font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-[#034D35] dark:text-[#B6F596]"
                />{" "}
                Automated eligibility validation
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-[#034D35] dark:text-[#B6F596]"
                />{" "}
                AI Technical Mock Practice
              </li>
            </ul>
          </div>

          {/* Card 3: Placement Officers */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#034D35] text-[#B6F596] flex items-center justify-center">
                  <Shield size={26} />
                </div>
                <span className="bg-[#F9F7F1] text-[#121212] dark:bg-slate-700 dark:text-gray-200 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  Officers
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#121212] dark:text-white">
                Placement (TPO)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                Bulk import student cohorts via CSV, review and authorize
                recruiter partner profiles, track email logs, and oversee campus
                placement statistics.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-[#121212] dark:text-gray-300 pt-6 border-t border-gray-100 dark:border-slate-700/80 font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-[#034D35] dark:text-[#B6F596]"
                />{" "}
                Bulk student cohort imports
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-[#034D35] dark:text-[#B6F596]"
                />{" "}
                Corporate partner workflows
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 mt-auto border-t border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto w-full px-6 py-10 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400 font-medium gap-6">
          <span>
            © {new Date().getFullYear()} CampusBridge Enterprise. All rights
            reserved.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <button
              onClick={handleLoginRedirect}
              className="hover:text-[#121212] dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleRegisterHRRedirect}
              className="hover:text-[#121212] dark:hover:text-white transition-colors"
            >
              Recruiter Registration
            </button>
            <a
              href="#"
              className="hover:text-[#121212] dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
