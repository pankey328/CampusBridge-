import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Search,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const COMPLAINT_TYPES = [
  "ALL",
  "Interview Scheduling",
  "Placement Drive & Eligibility",
  "Technical & Platform Issue",
  "Document & Profile Verification",
  "General / Policy Query",
];

const formatSafeDateTime = (dateVal) => {
  if (!dateVal) return "Recently";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Recently";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ComplaintHub = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, byType: [], byPriority: [], byStatus: [] });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Inspection Drawer
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");

  const fetchComplaints = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        complaintType: selectedType,
        priority: selectedPriority,
        status: selectedStatus,
        search,
      });

      const res = await api.get(`/complaints/admin/all?${params.toString()}`);
      if (res.data?.success) {
        setComplaints(res.data.data || []);
        setPagination(res.data.pagination);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
      toast.error("Could not fetch complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
  }, [selectedType, selectedPriority, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints(1);
  };

  const openInspection = (complaint) => {
    setSelectedComplaint(complaint);
    setEditStatus(complaint.status);
    setEditAdminNotes(complaint.adminNotes || "");
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/complaints/admin/${selectedComplaint._id}`, {
        status: editStatus,
        adminNotes: editAdminNotes,
      });

      if (res.data?.success) {
        toast.success("Complaint status updated successfully.");
        setSelectedComplaint(res.data.data);
        fetchComplaints(pagination.page);
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update complaint status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "High":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "Medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-800";
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Closed":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "Escalated":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
      case "Under Review":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "AI-Resolved":
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    }
  };

  const criticalCount =
    stats.byPriority?.find((p) => p._id === "Critical")?.count || 0;
  const highCount =
    stats.byPriority?.find((p) => p._id === "High")?.count || 0;
  const aiResolvedCount =
    stats.byStatus?.find((s) => s._id === "AI-Resolved")?.count || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B6F596]/30 dark:bg-[#034D35]/40 text-[#034D35] dark:text-[#B6F596] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            SuperAdmin AI Grievance Hub
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Student Complaint Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time feed of student grievances evaluated by Groq AI. Filter by type, view sentiment & urgency, and update resolution states.
          </p>
        </div>

        <button
          onClick={() => fetchComplaints(pagination.page)}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Tickets</span>
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Across all categories</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Critical Urgency</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{criticalCount}</div>
          <div className="text-xs text-gray-500 mt-1">Requires immediate placement attention</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">High Urgency</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{highCount}</div>
          <div className="text-xs text-gray-500 mt-1">Drive & schedule related</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">AI-Resolved</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{aiResolvedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Automated resolution delivered</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Category Pills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Filter by Complaint Type:
          </label>
          <div className="flex flex-wrap gap-2">
            {COMPLAINT_TYPES.map((type) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#034D35] text-white dark:bg-[#B6F596] dark:text-[#034D35] shadow-sm"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {type === "ALL" ? "All Categories" : type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search subject or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#034D35] dark:focus:ring-[#B6F596]"
            />
          </form>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#034D35]"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#034D35]"
            >
              <option value="ALL">All Statuses</option>
              <option value="AI-Resolved">AI-Resolved</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Escalated">Escalated</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center">
            <LifeBuoy className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 dark:text-white">No complaints found</h3>
            <p className="text-xs text-gray-500 mt-1">Try resetting the type or priority filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {complaints.map((item) => {
              const studentName = item.studentProfile
                ? `${item.studentProfile.firstName} ${item.studentProfile.lastName}`
                : "Student";
              const rollNumber = item.studentProfile?.rollNumber || "N/A";

              return (
                <div
                  key={item._id}
                  className="p-5 sm:p-6 hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                        #{item._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(item.priority)}`}>
                        {item.priority} Priority
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                        {item.complaintType}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                      {item.aiEvaluation?.sentiment && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-semibold">
                          Sentiment: {item.aiEvaluation.sentiment}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {item.subject}
                    </h3>

                    {item.aiEvaluation?.executiveSummary && (
                      <div className="flex items-start gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                        <span><strong>AI Summary:</strong> {item.aiEvaluation.executiveSummary}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span><strong>Student:</strong> {studentName} ({rollNumber})</span>
                      <span><strong>Email:</strong> {item.student?.email}</span>
                      <span><strong>Submitted:</strong> {formatSafeDateTime(item.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openInspection(item)}
                    className="self-start lg:self-center px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-[#034D35] hover:text-white dark:bg-slate-800 dark:hover:bg-[#B6F596] dark:hover:text-[#034D35] text-gray-800 dark:text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>Inspect & Action</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500">
            <div>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchComplaints(pagination.page - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchComplaints(pagination.page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INSPECTION MODAL / DRAWER */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-gray-400">
                TICKET #{selectedComplaint._id.slice(-6).toUpperCase()}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(selectedComplaint.priority)}`}>
                {selectedComplaint.priority} Priority
              </span>
            </div>

            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
              {selectedComplaint.subject}
            </h2>

            {/* Student metadata */}
            <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl mb-5 space-y-1 text-xs">
              <div><strong>Category:</strong> {selectedComplaint.complaintType}</div>
              <div><strong>Student Name:</strong> {selectedComplaint.studentProfile?.firstName} {selectedComplaint.studentProfile?.lastName}</div>
              <div><strong>Roll Number:</strong> {selectedComplaint.studentProfile?.rollNumber || "N/A"}</div>
              <div><strong>Email:</strong> {selectedComplaint.student?.email}</div>
              <div><strong>Branch:</strong> {selectedComplaint.studentProfile?.branch || "N/A"}</div>
            </div>

            {/* Student's Full Description */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Student's Submitted Issue:
              </label>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedComplaint.description}
              </div>
            </div>

            {/* AI Insights Box */}
            {selectedComplaint.aiEvaluation && (
              <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  AI Automatic Evaluation Insights
                </div>

                <div className="text-xs text-emerald-950 dark:text-emerald-200">
                  <strong>Recommended Action for Admin:</strong>{" "}
                  {selectedComplaint.aiEvaluation.suggestedAction}
                </div>

                <div className="text-xs text-emerald-900 dark:text-emerald-300 border-t border-emerald-200/60 dark:border-emerald-800/60 pt-2">
                  <strong className="block mb-1">AI Reply Delivered to Student Email:</strong>
                  <p className="italic leading-relaxed">"{selectedComplaint.aiEvaluation.aiReply}"</p>
                </div>
              </div>
            )}

            {/* Status & Admin Action */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Update Resolution Status:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#034D35]"
                >
                  <option value="AI-Resolved">AI-Resolved (Initial automated solution provided)</option>
                  <option value="Under Review">Under Review (Placement cell investigating)</option>
                  <option value="Escalated">Escalated (Forwarded to TPO/Dean)</option>
                  <option value="Closed">Closed (Resolved)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Placement Cell / Admin Internal Notes:
                </label>
                <textarea
                  rows={3}
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  placeholder="Record internal resolution details or action taken..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#034D35] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleUpdateComplaint}
                  className="px-6 py-2.5 rounded-xl bg-[#034D35] hover:bg-[#023826] text-white dark:bg-[#B6F596] dark:text-[#034D35] font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {updatingStatus ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Status & Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintHub;
