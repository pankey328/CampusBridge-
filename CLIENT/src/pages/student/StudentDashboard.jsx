import React from 'react';
import { Bot, Bell, ChevronRight, Sparkles } from 'lucide-react';

const StudentDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Welcome Back!</h1>
        <p className="text-[var(--color-text-secondary)]">Here is an overview of your placement journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          <div className="glass-panel p-8 rounded-2xl border border-[var(--color-brand-primary)]/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-primary)] rounded-full mix-blend-screen filter blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[var(--color-brand-primary)]/20 p-3 rounded-xl border border-[var(--color-brand-primary)]/30">
                  <Bot size={28} className="text-[var(--color-brand-primary)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center">
                  AI Mock Interviewer <Sparkles size={18} className="ml-2 text-yellow-400" />
                </h2>
              </div>
              
              <p className="text-[var(--color-text-secondary)] mb-8 max-w-lg leading-relaxed">
                Nervous about your upcoming interviews? Practice with our advanced AI Chatbot. 
                Get real-time feedback on your answers, body language tips, and technical question drills tailored to the company you are applying for.
              </p>
              
              <button className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-[#001E2B] font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center">
                Start Mock Interview
                <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Applications Submitted</h3>
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">0</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Upcoming Interviews</h3>
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">0</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          
          <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center">
                <Bell size={20} className="mr-2" />
                Recent Updates
              </h2>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 py-12">
              <Bell size={40} className="text-[var(--color-text-secondary)] mb-4" />
              <p className="text-[var(--color-text-primary)] font-medium">No new notifications</p>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1">When your application status changes, you will be notified here.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
