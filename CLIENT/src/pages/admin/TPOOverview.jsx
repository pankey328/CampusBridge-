import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Users, Building2, CheckCircle2, Clock, AlertTriangle, 
  FileText, ArrowUpRight, ChevronRight, Plus, FileSpreadsheet, 
  TrendingUp, Award, Layers, CheckSquare, BarChart2, PieChart as PieIcon, Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { downloadJSONasCSV } from '../../utils/csvUtils';

const TPOOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const basePath = '/admin';

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
      console.error("TPO Stats Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDownloadReport = async (reportType) => {
    try {
      setDownloadingReport(true);
      const res = await api.get(`/admin/reports/placement?reportType=${reportType}`, getAuthHeader());
      if (res.data && res.data.data) {
        if (res.data.data.length === 0) {
          toast.error("No data available for this report.");
          return;
        }
        downloadJSONasCSV(res.data.data, `${reportType}-report.csv`);
        toast.success("Report downloaded successfully.");
      }
    } catch (error) {
      console.error("Report Download Error:", error);
      toast.error("Failed to download report.");
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-primary)]"></div>
      </div>
    );
  }

  const placementRate = stats?.students?.total > 0 
    ? Math.round((stats.students.placed / stats.students.total) * 100) 
    : 0;

  const barChartData = [
    { name: 'Active Drives', count: stats?.drives?.active || 0, fill: '#00ED64' },
    { name: 'Pending Review', count: stats?.drives?.pending || 0, fill: '#eab308' },
    { name: 'Total Applications', count: stats?.applications?.total || 0, fill: '#3b82f6' },
    { name: 'Offers Extended', count: stats?.applications?.hired || 0, fill: '#10b981' },
    { name: 'Placed Students', count: stats?.students?.placed || 0, fill: '#a855f7' }
  ];

  const pieChartData = [
    { name: 'Placed Students', value: stats?.students?.placed || 0, color: '#00ED64' },
    { name: 'Unplaced / Active', value: Math.max(0, (stats?.students?.total || 0) - (stats?.students?.placed || 0)), color: '#3b82f6' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-bg-primary)] p-6 rounded-2xl border border-[var(--color-border)] shadow-md">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">TPO Overview</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Monitor campus placement activities and generate reports.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleDownloadReport('branch-stats')} 
            disabled={downloadingReport}
            className="px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-emerald-500/10 border border-[var(--color-border)] hover:border-emerald-500/30 text-xs font-semibold text-[var(--color-text-primary)] hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-2"
          >
            <BarChart2 size={16} /> Branch Stats CSV
          </button>
          <button 
            onClick={() => handleDownloadReport('placed-students')} 
            disabled={downloadingReport}
            className="px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-emerald-500/10 border border-[var(--color-border)] hover:border-emerald-500/30 text-xs font-semibold text-[var(--color-text-primary)] hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet size={16} /> Placed Students CSV
          </button>
          <button 
            onClick={() => handleDownloadReport('unplaced-students')} 
            disabled={downloadingReport}
            className="px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-yellow-500/10 border border-[var(--color-border)] hover:border-yellow-500/30 text-xs font-semibold text-[var(--color-text-primary)] hover:text-yellow-400 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet size={16} /> Unplaced Students CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active Hiring Drives */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Active Campus Drives</span>
            <div className="p-3 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] rounded-xl border border-[var(--color-brand-primary)]/20">
              <Briefcase size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[var(--color-text-primary)]">{stats?.drives?.active || 0}</h3>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-gray-400">{stats?.drives?.total || 0} Total Postings</span>
            </div>
          </div>
        </div>

        {/* Pending Drive Approvals */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Pending Approvals</span>
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
              <Clock size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[var(--color-text-primary)]">{stats?.drives?.pending || 0}</h3>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-yellow-400 font-semibold">
                {stats?.drives?.pending > 0 ? 'Requires TPO Action' : 'All Drives Approved'}
              </span>
            </div>
          </div>
        </div>

        {/* Total Applications */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Applications Received</span>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <FileText size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[var(--color-text-primary)]">{stats?.applications?.total || 0}</h3>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Award size={13} /> {stats?.applications?.hired || 0} Offers Extended
              </span>
            </div>
          </div>
        </div>

        {/* Eligible Student Pool */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Student Body</span>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[var(--color-text-primary)]">{stats?.students?.total || 0}</h3>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-emerald-400 font-semibold">{stats?.students?.placed || 0} Placed ({placementRate}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bar Chart of Placement Operations */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <BarChart2 size={20} className="text-[var(--color-brand-primary)]" /> Campus Placement Activity Funnel
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Operational metrics across drives, student applications, and offer extensions</p>
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

        {/* Student Placement Share Pie */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <PieIcon size={18} className="text-emerald-400" /> Student Placement Ratio
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Placed vs Unplaced candidate ratio</p>
            </div>
          </div>

          {pieChartData.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500">No student placement data available.</div>
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

      {/* Active & Recent Hiring Drives Section */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Active & Recent Hiring Drives</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Review candidate applications and update statuses</p>
          </div>
          <button
            onClick={() => navigate(`${basePath}/job-drives`)}
            className="text-xs font-semibold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1"
          >
            <span>Manage All Drives ({stats?.drives?.total || 0})</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {!stats?.recentDrives || stats.recentDrives.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-text-secondary)] text-sm">
            No campus placement drives created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentDrives.map((drive) => (
              <div
                key={drive._id}
                className="bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-primary)]/40 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-[var(--color-text-primary)] text-sm">{drive.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      drive.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : drive.status === 'PENDING_APPROVAL'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>
                      {drive.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-brand-primary)] font-semibold">{drive.companyName}</p>
                </div>

                <div className="flex items-center gap-4">
                  {drive.packageLPA && (
                    <span className="text-xs font-bold text-yellow-400 hidden sm:inline-block">
                      {drive.packageLPA} LPA
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`${basePath}/job-drives`)}
                    className="px-3.5 py-1.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Manage Drive</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default TPOOverview;
