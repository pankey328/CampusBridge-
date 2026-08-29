import React, { useState, useEffect } from "react";
import {
  FileText,
  FileSpreadsheet,
  Plus,
  ChevronRight,
  Clock,
  Briefcase,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { downloadJSONasCSV } from "../../utils/csvUtils";

const HRDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDrives: 0,
    totalApplicants: 0,
    hiredCandidates: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/dashboard", getAuthHeader());
      setStats(response.data.stats);
      setChartData(response.data.chartData);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportType) => {
    try {
      setDownloadingReport(true);
      const res = await api.get(
        `/hr/reports/drives?reportType=${reportType}`,
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

  const COLORS = [
    "#034D35", 
    "#B6F596", 
    "#3b82f6", 
    "#8b5cf6", 
    "#eab308", 
    "#ef4444", 
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight mb-2">
            HR Dashboard
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage your company's campus recruitment drives and track
            applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleDownloadReport("applicants")}
            disabled={downloadingReport}
            className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-bold text-[#121212] dark:text-white rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet size={16} className="text-blue-500" />
            <span>Applicants CSV</span>
          </button>

          <button
            onClick={() => handleDownloadReport("hired")}
            disabled={downloadingReport}
            className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-bold text-[#121212] dark:text-white rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet
              size={16}
              className="text-[#034D35] dark:text-[#B6F596]"
            />
            <span>Hired CSV</span>
          </button>

          <button
            onClick={() => navigate("/hr/job-drives/create")}
            className="bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-2.5 px-6 rounded-full shadow-md transition-all flex items-center shrink-0 text-sm"
          >
            <Plus size={18} className="mr-1.5" />
            Post New Job Drive
          </button>
        </div>
      </div>

      {/* Minimalist Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#B6F596]/30 dark:bg-[#034D35]/50 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="p-4 bg-[#F9F7F1] dark:bg-slate-900 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-700/50">
              <Briefcase
                className="text-[#034D35] dark:text-[#B6F596]"
                size={28}
              />
            </div>
            <TrendingUp
              className="text-[#034D35] dark:text-[#B6F596] opacity-80"
              size={24}
            />
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">
            Active Job Drives
          </h3>
          <p className="text-5xl md:text-6xl font-extrabold text-[#121212] dark:text-white relative z-10">
            {stats.activeDrives}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 dark:bg-blue-900/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="p-4 bg-[#F9F7F1] dark:bg-slate-900 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-700/50">
              <Users className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">
            Total Applicants
          </h3>
          <p className="text-5xl md:text-6xl font-extrabold text-[#121212] dark:text-white relative z-10">
            {stats.totalApplicants}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 dark:bg-purple-900/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="p-4 bg-[#F9F7F1] dark:bg-slate-900 rounded-[20px] shadow-sm border border-gray-100 dark:border-slate-700/50">
              <Building2
                className="text-purple-600 dark:text-purple-400"
                size={28}
              />
            </div>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">
            Candidates Hired
          </h3>
          <p className="text-5xl md:text-6xl font-extrabold text-[#121212] dark:text-white relative z-10">
            {stats.hiredCandidates}
          </p>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Chart Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors duration-300">
          <h2 className="text-xl font-extrabold text-[#121212] dark:text-white mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
            Applications by Status
          </h2>

          <div className="w-full h-[320px] relative">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={130}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-[#F9F7F1] dark:bg-slate-900 p-6 rounded-full mb-4">
                  <PieChart
                    size={40}
                    className="text-gray-300 dark:text-gray-600"
                  />
                </div>
                <p className="text-[#121212] dark:text-white font-bold">
                  No application data yet
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Metrics will appear here once candidates apply.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-[450px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-6 shrink-0 border-b border-gray-100 dark:border-slate-700 pb-4">
            <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
              Recent Activity
            </h2>
            <button
              onClick={() => navigate("/hr/job-drives")}
              className="text-xs font-bold text-[#034D35] dark:text-[#B6F596] hover:bg-[#B6F596]/30 transition-colors flex items-center bg-[#B6F596]/20 dark:bg-[#034D35]/50 px-4 py-1.5 rounded-full uppercase tracking-wider"
            >
              View All <ChevronRight size={14} className="ml-1" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start p-5 bg-[#F9F7F1] dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-700/50 hover:shadow-sm transition-all"
                >
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-[16px] mr-4 shadow-sm border border-gray-200 dark:border-slate-700 shrink-0">
                    <FileText
                      size={20}
                      className="text-[#034D35] dark:text-[#B6F596]"
                    />
                  </div>
                  <div>
                    <p className="text-[#121212] dark:text-white font-bold text-sm leading-snug">
                      {activity.studentName}{" "}
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        applied for
                      </span>{" "}
                      {activity.jobTitle}
                    </p>
                    <div className="flex flex-wrap items-center mt-2.5 gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />{" "}
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full uppercase tracking-wider text-[9px] ${
                          activity.status === "HIRED"
                            ? "bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596]"
                            : activity.status === "REJECTED"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : activity.status === "APPLIED"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-[#F9F7F1] dark:bg-slate-900 p-5 rounded-full mb-4">
                  <Briefcase
                    size={32}
                    className="text-gray-300 dark:text-gray-600"
                  />
                </div>
                <p className="text-[#121212] dark:text-white font-bold">
                  No recent activity
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Actions will appear here as drives progress.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
