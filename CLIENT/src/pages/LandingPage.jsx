import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Shield, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  Laptop,
  Mail,
  Video,
  FileText
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleRegisterHRRedirect = () => {
    navigate('/register-hr');
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-white font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Accent Gradients */}
      <div className="absolute w-[500px] h-[500px] bg-[#00ED64]/5 rounded-full mix-blend-screen filter blur-[150px] -top-52 -left-32 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-[#00ED64]/5 rounded-full mix-blend-screen filter blur-[150px] -bottom-52 -right-32 pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-gray-800/40">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/20 flex items-center justify-center">
            <Building2 className="text-[#00ED64] h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            Campus<span className="text-[#00ED64]">Bridge</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLoginRedirect}
            className="text-gray-400 hover:text-white text-sm font-semibold transition-colors py-2 px-4"
          >
            Sign In
          </button>
          <button 
            onClick={handleRegisterHRRedirect}
            className="bg-[#00ED64]/10 hover:bg-[#00ED64]/20 text-[#00ED64] border border-[#00ED64]/30 font-semibold text-xs py-2 px-4 rounded-xl transition-all"
          >
            Register as Recruiter
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col justify-center py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: CTA & Headline */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#00ED64]/10 border border-[#00ED64]/20 rounded-full px-4 py-1.5 text-xs text-[#00ED64] font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 bg-[#00ED64] rounded-full"></span>
              Institutional Placement Automation
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Bridging Corporate Recruitment <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ED64] to-[#00c954]">
                With Student Potential.
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
              CampusBridge is the institutional placement suite that automates recruitment drives. It streamlines student eligibility validation, automates recruiter communications, and facilitates online and offline interview management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={handleLoginRedirect}
                className="bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-[#00ED64]/10 flex items-center justify-center gap-2 group text-sm"
              >
                <span>Enter Placement Portal</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={handleRegisterHRRedirect}
                className="bg-transparent hover:bg-gray-800/40 text-gray-300 border border-gray-700 hover:border-gray-600 font-semibold py-3.5 px-8 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                <span>Corporate Recruiting registration</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Mini Dashboard Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-[#00ED64]/10 rounded-3xl filter blur-3xl pointer-events-none opacity-40"></div>
            
            {/* Visual Glassmorphic Dashboard Preview */}
            <div className="relative bg-[#112240] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Placement Stats Overview */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-800/60">
                <div>
                  <h3 className="font-bold text-white text-sm">Institutional Operations</h3>
                  <p className="text-xs text-gray-500">Live Campus Drive Status</p>
                </div>
                <div className="bg-[#00ED64]/10 text-[#00ED64] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#00ED64]/20">
                  Active Ecosystem
                </div>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A192F] p-4 rounded-xl border border-gray-800/80">
                  <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                    <Users size={14} className="text-[#00ED64]" />
                    <span>Active Candidates</span>
                  </div>
                  <div className="text-xl font-bold text-white">450+</div>
                </div>
                <div className="bg-[#0A192F] p-4 rounded-xl border border-gray-800/80">
                  <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                    <Briefcase size={14} className="text-[#00ED64]" />
                    <span>Drives Managed</span>
                  </div>
                  <div className="text-xl font-bold text-white">32</div>
                </div>
              </div>

              {/* Status Feed Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#0A192F]/60 p-3 rounded-lg border border-gray-800/50">
                  <div className="flex items-center space-x-2 min-w-0">
                    <CheckCircle2 size={16} className="text-[#00ED64] shrink-0" />
                    <span className="text-xs text-gray-300 truncate font-semibold">TPO Approved HR Account</span>
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0 font-medium">Just now</span>
                </div>
                <div className="flex items-center justify-between bg-[#0A192F]/60 p-3 rounded-lg border border-gray-800/50">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Video size={16} className="text-blue-400 shrink-0" />
                    <span className="text-xs text-gray-300 truncate font-semibold">Online Interview Scheduled</span>
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0 font-medium">5m ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Core Features Grid Section */}
        <div className="mt-24 md:mt-32 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Platform Core Features</h2>
            <p className="text-gray-400 text-sm">Integrated tools built specifically to automate institutional recruitment pipelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Recruiters */}
            <div className="bg-[#112240] p-6 rounded-2xl border border-gray-800 hover:border-[#00ED64]/30 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex bg-[#00ED64]/10 text-[#00ED64] p-3 rounded-xl border border-[#00ED64]/20">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">For Recruiter Partners (HR)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Post detailed job drives, filter applicants based on exact criteria, shortlist candidates instantly, and schedule either offline or online virtual interviews directly.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-gray-800/40">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#00ED64]" /> Easy Drive Creation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#00ED64]" /> Unified Application Tracking
                </li>
              </ul>
            </div>

            {/* Students */}
            <div className="bg-[#112240] p-6 rounded-2xl border border-gray-800 hover:border-[#00ED64]/30 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex bg-[#00ED64]/10 text-[#00ED64] p-3 rounded-xl border border-[#00ED64]/20">
                  <Users size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">For Students</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Validate eligibility dynamically, upload resumes securely, submit applications in one click, and track upcoming slots and interviews in real-time.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-gray-800/40">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#00ED64]" /> Automated Resume Hosting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#00ED64]" /> One-Click Job Application
                </li>
              </ul>
            </div>

            {/* TPO Officers */}
            <div className="bg-[#112240] p-6 rounded-2xl border border-gray-800 hover:border-[#00ED64]/30 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex bg-[#00ED64]/10 text-[#00ED64] p-3 rounded-xl border border-[#00ED64]/20">
                  <Shield size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">For Placement Officers (TPO)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Manage candidate databases, perform bulk student imports, review corporate partner requests, view automated system logs, and coordinate institutional placement events.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-gray-800/40">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#00ED64]" /> Corporate Partner Approvals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-[#00ED64]" /> Bulk Candidate Import
                </li>
              </ul>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 mt-16 border-t border-gray-800/40 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <span>© {new Date().getFullYear()} CampusBridge Platform. All rights reserved.</span>
        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-gray-450 transition-colors">Documentation</a>
          <a href="#" className="hover:text-gray-450 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-450 transition-colors">Terms of Service</a>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
