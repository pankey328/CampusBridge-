import React, { useState, useEffect } from 'react';
import { Building2, Users, Briefcase, Plus, ChevronRight, TrendingUp, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDrives: 0,
    totalApplicants: 0,
    hiredCandidates: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr/dashboard', getAuthHeader());
      setStats(response.data.stats);
      setChartData(response.data.chartData);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#00ED64', '#3b82f6', '#8b5cf6', '#eab308', '#ef4444', '#64748b'];

  const chartDataWithColors = chartData.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length]
  }));

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
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

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 pb-2">
        
        {/* Chart Section */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] relative overflow-hidden flex flex-col h-full">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center">
            Applications by Status
          </h2>
          <div className="flex-1 w-full relative">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataWithColors}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', color: 'var(--color-text-secondary)' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60 absolute inset-0">
                <p className="text-[var(--color-text-primary)] font-medium">No applications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] relative overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center">
              Recent Activity
            </h2>
            <button 
              onClick={() => navigate('/hr/job-drives')}
              className="text-sm text-[var(--color-brand-primary)] hover:underline flex items-center"
            >
              View All <ChevronRight size={14} className="ml-1" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start p-4 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/50 transition-colors">
                  <div className="bg-[var(--color-bg-secondary)] p-2 rounded-lg mr-4 mt-1">
                    <FileText size={20} className="text-[var(--color-brand-primary)]" />
                  </div>
                  <div>
                    <p className="text-[var(--color-text-primary)] font-medium">
                      {activity.studentName} <span className="text-[var(--color-text-secondary)] font-normal">applied for</span> {activity.jobTitle}
                    </p>
                    <div className="flex items-center mt-2 space-x-3 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center"><Clock size={12} className="mr-1" /> {new Date(activity.timestamp).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full border ${activity.status === 'HIRED' ? 'border-green-500/30 text-green-400 bg-green-500/10' : activity.status === 'REJECTED' ? 'border-red-500/30 text-red-400 bg-red-500/10' : activity.status === 'APPLIED' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <div className="bg-[var(--color-bg-primary)] p-4 rounded-full mb-4 border border-[var(--color-border)]">
                  <Briefcase size={32} className="text-[var(--color-text-secondary)]" />
                </div>
                <p className="text-[var(--color-text-primary)] font-medium">No recent activity</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default HRDashboard;
