import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Building2, Briefcase, CheckCircle2, Clock, 
  AlertTriangle, Mail, Sparkles, UserPlus, ArrowUpRight, ChevronRight, 
  Settings, Award, Lock, FileSpreadsheet, Activity, BarChart2, PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../services/api';

const SuperAdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard-stats', getAuthHeader());
      if (res.data && res.data.data) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("SuperAdmin Stats Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const placementRate = stats?.students?.total > 0 
    ? Math.round((stats.students.placed / stats.students.total) * 100) 
    : 0;

  const barChartData = [
    { name: 'Total Students', count: stats?.students?.total || 0, fill: '#3b82f6' },
    { name: 'Placed Students', count: stats?.students?.placed || 0, fill: '#00ED64' },
    { name: 'Active Drives', count: stats?.drives?.active || 0, fill: '#10b981' },
    { name: 'Pending Drives', count: stats?.drives?.pending || 0, fill: '#eab308' },
    { name: 'HR Partners', count: stats?.hrs?.total || 0, fill: '#a855f7' }
  ];

  const pieChartData = [
    { name: 'Active Drives', value: stats?.drives?.active || 0, color: '#00ED64' },
    { name: 'Pending Review', value: stats?.drives?.pending || 0, color: '#eab308' },
    { name: 'Completed', value: stats?.drives?.completed || 0, color: '#3b82f6' },
    { name: 'Drafts', value: Math.max(0, (stats?.drives?.total || 0) - (stats?.drives?.active || 0) - (stats?.drives?.pending || 0) - (stats?.drives?.completed || 0)), color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total TPO Officers */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">TPO Officers</span>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30">
              <Shield size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{stats?.tpos?.total || 0}</h3>
            <p className="text-xs text-purple-300 mt-2 font-medium">Placement Administrators</p>
          </div>
        </div>

        {/* Pending HR Approvals */}
        <div className="glass-panel p-6 rounded-2xl border border-yellow-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">HR Approvals</span>
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/30">
              <Building2 size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{stats?.hrs?.pending || 0}</h3>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-yellow-400 font-semibold">
                {stats?.hrs?.pending > 0 ? `${stats.hrs.pending} Action Needed` : 'All Approved'}
              </span>
              <span className="text-gray-400">{stats?.hrs?.total || 0} Total HRs</span>
            </div>
          </div>
        </div>

        {/* System Students & Placements */}
        <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Student Body</span>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{stats?.students?.total || 0}</h3>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> {stats?.students?.placed || 0} Placed ({placementRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* System Drives */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Placement Drives</span>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Briefcase size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">{stats?.drives?.total || 0}</h3>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-emerald-400 font-semibold">{stats?.drives?.active || 0} Active Now</span>
              <span className="text-yellow-400">{stats?.drives?.pending || 0} Pending</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bar Chart of System Distribution */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart2 size={20} className="text-purple-400" /> Placement & Recruitment System Metrics
              </h3>
              <p className="text-xs text-gray-400">Live breakdown of student enrollment, active drives, and corporate accounts</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A192F', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Drives Status Pie Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon size={18} className="text-emerald-400" /> Drive Status Distribution
              </h3>
              <p className="text-xs text-gray-400">Active vs Pending vs Completed drives</p>
            </div>
          </div>

          {pieChartData.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500">No drive data available.</div>
          ) : (
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A192F', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }}
                  />
                  <Legend formatter={(value) => <span className="text-xs text-gray-300 font-medium">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* SuperAdmin Core Audit & Approvals Section */}
      <div className="space-y-6">
        
        {/* Pending HR Action Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-yellow-400" /> Pending Corporate HR Approvals
              </h3>
              <p className="text-xs text-gray-400">Approve or reject company registrations before drive creation</p>
            </div>
            <button
              onClick={() => navigate('/superadmin/hr')}
              className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Manage All HRs</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {stats?.hrs?.pending === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm bg-black/20 rounded-xl border border-gray-800/50">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
              <p className="font-semibold text-white">No Pending HR Approvals</p>
              <p className="text-xs text-gray-500 mt-1">All corporate partner registrations are up to date.</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-yellow-300 text-sm">{stats?.hrs?.pending} Corporate HR Accounts Await Verification</h4>
                <p className="text-xs text-gray-300">Review company GSTIN and LinkedIn credentials to activate access.</p>
              </div>
              <button
                onClick={() => navigate('/superadmin/hr')}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold rounded-lg text-xs transition-colors shrink-0"
              >
                Review Approvals
              </button>
            </div>
          )}
        </div>

        {/* System Email Audit Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail size={20} className="text-blue-400" /> System Notification Audit Stream
              </h3>
              <p className="text-xs text-gray-400">Real-time log of dispatched credentials and invitation emails</p>
            </div>
            <button
              onClick={() => navigate('/superadmin/notifications')}
              className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Audit Log</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {!stats?.recentLogs || stats.recentLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">No email audit logs found.</div>
          ) : (
            <div className="space-y-2.5">
              {stats.recentLogs.map((log, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0A192F] border border-gray-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 max-w-md">
                    <p className="font-semibold text-white truncate">{log.recipientEmail}</p>
                    <p className="text-[11px] text-gray-400 truncate">{log.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : log.status === 'FAILED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default SuperAdminOverview;
