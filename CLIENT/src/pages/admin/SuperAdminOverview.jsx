import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  Mail,
  ChevronRight,
  FileSpreadsheet,
  BarChart2,
  PieChart as PieIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../services/api";
import toast from "react-hot-toast";
import { downloadJSONasCSV } from "../../utils/csvUtils";

const SuperAdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard-stats", getAuthHeader());
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

  const handleDownloadReport = async (reportType) => {
    try {
      setDownloadingReport(true);
      const res = await api.get(
        `/admin/reports/placement?reportType=${reportType}`,
        getAuthHeader(),
      );
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
      </div>
    );
  }

  const placementRate =
    stats?.students?.total > 0
      ? Math.round((stats.students.placed / stats.students.total) * 100)
      : 0;

  const CORE_COLORS = ["#034D35", "#B6F596", "#3b82f6", "#8b5cf6", "#eab308"];

  const barChartData = [
    {
      name: "Total Students",
      count: stats?.students?.total || 0,
      fill: CORE_COLORS[2],
    },
    {
      name: "Placed Students",
      count: stats?.students?.placed || 0,
      fill: CORE_COLORS[1],
    },
    {
      name: "Active Drives",
      count: stats?.drives?.active || 0,
      fill: CORE_COLORS[0],
    },
    {
      name: "Pending Drives",
      count: stats?.drives?.pending || 0,
      fill: CORE_COLORS[4],
    },
    {
      name: "HR Partners",
      count: stats?.hrs?.total || 0,
      fill: CORE_COLORS[3],
    },
  ];

  const pieChartData = [
    {
      name: "Active Drives",
      value: stats?.drives?.active || 0,
      color: CORE_COLORS[0],
    },
    {
      name: "Pending Review",
      value: stats?.drives?.pending || 0,
      color: CORE_COLORS[4],
    },
    {
      name: "Completed",
      value: stats?.drives?.completed || 0,
      color: CORE_COLORS[2],
    },
    {
      name: "Drafts",
      value: Math.max(
        0,
        (stats?.drives?.total || 0) -
          (stats?.drives?.active || 0) -
          (stats?.drives?.pending || 0) -
          (stats?.drives?.completed || 0),
      ),
      color: "#94a3b8",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#121212] dark:text-white tracking-tight">
            SuperAdmin Overview
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Monitor system wide metrics and export global placement reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleDownloadReport("branch-stats")}
            disabled={downloadingReport}
            className="px-5 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-bold text-[#121212] dark:text-white rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <BarChart2 size={16} className="text-purple-500" /> Branch Stats CSV
          </button>
          <button
            onClick={() => handleDownloadReport("placed-students")}
            disabled={downloadingReport}
            className="px-5 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-bold text-[#121212] dark:text-white rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet size={16} className="text-blue-500" /> Placed CSV
          </button>
          <button
            onClick={() => handleDownloadReport("unplaced-students")}
            disabled={downloadingReport}
            className="px-5 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-bold text-[#121212] dark:text-white rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet size={16} className="text-amber-500" /> Unplaced
            CSV
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total TPO Officers */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 dark:bg-purple-900/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">
              TPO Officers
            </h3>
            <div className="p-3 bg-[#F9F7F1] dark:bg-slate-900 rounded-[16px] shadow-sm border border-gray-100 dark:border-slate-700/50">
              <Shield
                className="text-purple-600 dark:text-purple-400"
                size={24}
              />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-5xl font-extrabold text-[#121212] dark:text-white leading-none">
              {stats?.tpos?.total || 0}
            </p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">
              Placement Administrators
            </p>
          </div>
        </div>

        {/* Pending HR Approvals */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-amber-200 dark:border-amber-800/50 shadow-sm relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 dark:bg-amber-900/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">
              HR Approvals
            </h3>
            <div className="p-3 bg-[#F9F7F1] dark:bg-slate-900 rounded-[16px] shadow-sm border border-gray-100 dark:border-slate-700/50">
              <Building2 className="text-amber-500" size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-5xl font-extrabold text-[#121212] dark:text-white leading-none">
              {stats?.hrs?.pending || 0}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs font-bold">
              <span className="text-amber-600 dark:text-amber-400">
                {stats?.hrs?.pending > 0
                  ? `${stats.hrs.pending} Action Needed`
                  : "All Approved"}
              </span>
              <span className="text-gray-400 dark:text-gray-500">
                {stats?.hrs?.total || 0} Total HRs
              </span>
            </div>
          </div>
        </div>

        {/* System Students & Placements */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 dark:bg-blue-900/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">
              Student Body
            </h3>
            <div className="p-3 bg-[#F9F7F1] dark:bg-slate-900 rounded-[16px] shadow-sm border border-gray-100 dark:border-slate-700/50">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-5xl font-extrabold text-[#121212] dark:text-white leading-none">
              {stats?.students?.total || 0}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs font-bold">
              <span className="text-[#034D35] dark:text-[#B6F596] flex items-center gap-1">
                <CheckCircle2 size={14} /> {stats?.students?.placed || 0} Placed
                ({placementRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* System Drives */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#B6F596]/30 dark:bg-[#034D35]/50 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">
              Placement Drives
            </h3>
            <div className="p-3 bg-[#F9F7F1] dark:bg-slate-900 rounded-[16px] shadow-sm border border-gray-100 dark:border-slate-700/50">
              <Briefcase
                className="text-[#034D35] dark:text-[#B6F596]"
                size={24}
              />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-5xl font-extrabold text-[#121212] dark:text-white leading-none">
              {stats?.drives?.total || 0}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs font-bold">
              <span className="text-[#034D35] dark:text-[#B6F596]">
                {stats?.drives?.active || 0} Active Now
              </span>
              <span className="text-amber-500">
                {stats?.drives?.pending || 0} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Bar Chart of System Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#121212] dark:text-white flex items-center gap-2">
                <BarChart2 size={24} className="text-purple-500" /> Placement &
                Recruitment System Metrics
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                Live breakdown of student enrollment, active drives, and
                corporate accounts
              </p>
            </div>
          </div>

          <div className="w-full h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "none",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    color: "#121212",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#121212", fontWeight: "bold" }}
                  cursor={{ fill: "rgba(156, 163, 175, 0.1)" }}
                />
                <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={48}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Drives Status Pie Distribution */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4 mb-6 shrink-0">
            <div>
              <h3 className="text-xl font-extrabold text-[#121212] dark:text-white flex items-center gap-2">
                <PieIcon size={24} className="text-blue-500" /> Drive Status
                Distribution
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                Active vs Pending vs Completed drives
              </p>
            </div>
          </div>

          <div className="w-full h-80 flex items-center justify-center relative">
            {pieChartData.length === 0 ? (
              <div className="text-center absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 font-bold">
                  No drive data available.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "none",
                      borderRadius: "16px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      color: "#121212",
                      fontWeight: "bold",
                    }}
                    itemStyle={{ color: "#121212", fontWeight: "bold" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ paddingTop: "24px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* SuperAdmin Core Audit & Approvals Section */}
      <div className="space-y-8">
        {/* Pending HR Action Panel */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm space-y-6 transition-colors duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-[#121212] dark:text-white flex items-center gap-2">
                <Building2 size={24} className="text-amber-500" /> Pending
                Corporate HR Approvals
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                Approve or reject company registrations before drive creation
              </p>
            </div>
            <button
              onClick={() => navigate("/superadmin/hr")}
              className="text-xs font-bold text-[#034D35] dark:text-[#B6F596] hover:bg-[#B6F596]/30 transition-colors flex items-center bg-[#B6F596]/20 dark:bg-[#034D35]/50 px-4 py-1.5 rounded-full uppercase tracking-wider shrink-0"
            >
              <span>Manage All HRs</span>
              <ChevronRight size={14} className="ml-1" />
            </button>
          </div>

          {stats?.hrs?.pending === 0 ? (
            <div className="text-center py-10 bg-[#F9F7F1] dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-700/50 shadow-sm">
              <CheckCircle2
                size={36}
                className="mx-auto mb-3 text-[#034D35] dark:text-[#B6F596]"
              />
              <p className="font-extrabold text-[#121212] dark:text-white text-lg">
                No Pending HR Approvals
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                All corporate partner registrations are up to date.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-[24px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1.5 text-center md:text-left">
                <h4 className="font-extrabold text-amber-700 dark:text-amber-400 text-lg">
                  {stats?.hrs?.pending} Corporate HR Accounts Await Verification
                </h4>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-300">
                  Review company GSTIN and LinkedIn credentials to activate
                  access.
                </p>
              </div>
              <button
                onClick={() => navigate("/superadmin/hr")}
                className="px-6 py-3 bg-[#121212] hover:bg-black !text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:!text-[#121212] font-bold rounded-full text-sm transition-all shadow-md shrink-0 w-full md:w-auto"
              >
                Review Approvals
              </button>
            </div>
          )}
        </div>

        {/* System Email Audit Stream */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm space-y-6 transition-colors duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-[#121212] dark:text-white flex items-center gap-2">
                <Mail size={24} className="text-indigo-500" /> System
                Notification Audit Stream
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                Real-time log of dispatched credentials and invitation emails
              </p>
            </div>
            <button
              onClick={() => navigate("/superadmin/notifications")}
              className="text-xs font-bold text-[#034D35] dark:text-[#B6F596] hover:bg-[#B6F596]/30 transition-colors flex items-center bg-[#B6F596]/20 dark:bg-[#034D35]/50 px-4 py-1.5 rounded-full uppercase tracking-wider shrink-0"
            >
              <span>Full Audit Log</span>
              <ChevronRight size={14} className="ml-1" />
            </button>
          </div>

          {!stats?.recentLogs || stats.recentLogs.length === 0 ? (
            <div className="text-center py-10 bg-[#F9F7F1] dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-700/50 shadow-sm">
              <Mail
                size={36}
                className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
              />
              <p className="font-extrabold text-[#121212] dark:text-white text-lg">
                No email audit logs found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-[20px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-extrabold text-[#121212] dark:text-white text-sm truncate">
                      {log.recipientEmail}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                      {log.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        log.status === "DELIVERED"
                          ? "bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596]"
                          : log.status === "FAILED"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
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
