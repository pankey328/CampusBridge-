import React, { useState, useEffect } from 'react';
import { Building2, Users, Briefcase, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeDrives: 0,
    totalApplicants: 0,
    hiredCandidates: 0
  });

  useEffect(() => {
    // Fetch data
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">HR Dashboard</h1>
          <p className="text-[var(--color-text-secondary)]">Manage your company's campus recruitment drives.</p>
        </div>
        
        <button 
          onClick={() => navigate('/hr/job-drives/create')}
          className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-[#001E2B] font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(0,237,100,0.2)] hover:shadow-[0_0_30px_rgba(0,237,100,0.4)] transition-all flex items-center shrink-0"
        >
          <Plus size={20} className="mr-2" />
          Post New Job Drive
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-primary)]/10 rounded-full blur-3xl group-hover:bg-[var(--color-brand-primary)]/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)]">
              <Briefcase className="text-[var(--color-brand-primary)]" size={24} />
            </div>
            <TrendingUp className="text-[var(--color-text-secondary)]" size={20} />
          </div>
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1 relative z-10">Active Job Drives</h3>
          <p className="text-4xl font-bold text-[var(--color-text-primary)] relative z-10">{stats.activeDrives}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)]">
              <Users className="text-blue-400" size={24} />
            </div>
          </div>
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1 relative z-10">Total Applicants</h3>
          <p className="text-4xl font-bold text-[var(--color-text-primary)] relative z-10">{stats.totalApplicants}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)]">
              <Building2 className="text-purple-400" size={24} />
            </div>
          </div>
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1 relative z-10">Candidates Hired</h3>
          <p className="text-4xl font-bold text-[var(--color-text-primary)] relative z-10">{stats.hiredCandidates}</p>
        </div>
      </div>

      {/* Quick Actions / Info */}
      <div className="glass-panel p-8 rounded-2xl border border-[var(--color-border)] relative overflow-hidden">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center">
          Recent Activity
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
          <div className="bg-[var(--color-bg-primary)] p-4 rounded-full mb-4 border border-[var(--color-border)]">
            <Briefcase size={32} className="text-[var(--color-text-secondary)]" />
          </div>
          <p className="text-[var(--color-text-primary)] font-medium">No recent activity</p>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1 max-w-sm">
            When students apply to your job drives or when you post new drives, they will appear here.
          </p>
          <button 
            onClick={() => navigate('/hr/job-drives')}
            className="mt-6 text-[var(--color-brand-primary)] font-semibold hover:underline flex items-center"
          >
            Go to My Job Drives <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default HRDashboard;
