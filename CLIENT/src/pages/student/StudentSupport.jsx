import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Send,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Calendar,
  Briefcase,
  Cpu,
  FileCheck,
  ChevronRight,
  RefreshCw,
  Mail,
  Shield,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const COMPLAINT_CATEGORIES = [
  {
    type: "Interview Scheduling",
    title: "Interview Scheduling",
    description: "Slot conflicts, rescheduling requests, or missed interview links",
    icon: <Calendar className="w-5 h-5 text-orange-500" />,
    priorityHint: "High / Critical Urgency",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  {
    type: "Placement Drive & Eligibility",
    title: "Placement Drive & Eligibility",
    description: "CGPA/Backlog criteria discrepancies, drive registration access",
    icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
    priorityHint: "High Urgency",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    type: "Technical & Platform Issue",
    title: "Technical & Platform Issue",
    description: "Resume upload errors, mock evaluation bugs, portal glitches",
    icon: <Cpu className="w-5 h-5 text-blue-500" />,
    priorityHint: "Medium Urgency",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    type: "Document & Profile Verification",
    title: "Document & Verification",
    description: "TPO profile locking, unapproved certificates or marksheet records",
    icon: <FileCheck className="w-5 h-5 text-purple-500" />,
    priorityHint: "Medium Urgency",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  {
    type: "General / Policy Query",
    title: "General / Policy Query",
    description: "Placement policy questions, company blacklisting rules, offer letters",
    icon: <HelpCircle className="w-5 h-5 text-slate-500" />,
    priorityHint: "Standard Urgency",
    badgeColor: "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300",
  },
];

const StudentSupport = () => {
  const [activeTab, setActiveTab] = useState("new"); // "new" | "history"
  const [complaintType, setComplaintType] = useState(COMPLAINT_CATEGORIES[0].type);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(""); // "ai", "email", "db"
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [resolvedResultModal, setResolvedResultModal] = useState(null);
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);

  const fetchMyComplaints = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get("/complaints/my");
      if (res.data?.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
      toast.error("Could not load complaint history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in both the subject and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStep("AI is analyzing issue and formulating resolution...");

      const payload = {
        complaintType,
        subject: subject.trim(),
        description: description.trim(),
      };

      const res = await api.post("/complaints", payload);

      if (res.data?.success) {
        toast.success("Complaint evaluated and confirmation email sent!");
        setResolvedResultModal(res.data.data);
        setSubject("");
        setDescription("");
        fetchMyComplaints();
      }
    } catch (err) {
      console.error("Submission failed:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to process complaint. Any pending changes were rolled back.";
      toast.error(errMsg, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
      setSubmitStep("");
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

  const formatSafeDate = (dateVal) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B6F596]/30 dark:bg-[#034D35]/40 text-[#034D35] dark:text-[#B6F596] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Grievance & Student Support
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Grievance & Support Desk
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Raise placement-related complaints. Our AI evaluates urgency, provides immediate resolution guidance, sends email confirmation, and logs your ticket for SuperAdmin review.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl self-start md:self-auto border border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "new"
                ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Submit Complaint
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              fetchMyComplaints();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span>My Complaints</span>
            {history.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-[#B6F596] text-[#034D35] font-bold rounded-full">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: NEW COMPLAINT FORM */}
      {activeTab === "new" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-[#034D35] dark:text-[#B6F596]" />
                Select Complaint Type
              </h2>

              {/* Category Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {COMPLAINT_CATEGORIES.map((cat) => {
                  const isSelected = complaintType === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setComplaintType(cat.type)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#034D35] dark:border-[#B6F596] bg-[#034D35]/5 dark:bg-[#034D35]/20 ring-2 ring-[#034D35]/20"
                          : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800">
                          {cat.icon}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeColor}`}
                        >
                          {cat.priorityHint}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {cat.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {cat.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Form inputs */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Subject / Issue Heading *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    placeholder="e.g., Unable to join interview slot for Google Drive / CGPA discrepancy"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#034D35] dark:focus:ring-[#B6F596]"
                  />
                  <div className="text-right text-[11px] text-gray-400 mt-1">
                    {subject.length}/150
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Detailed Complaint Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    maxLength={2000}
                    placeholder="Provide specific details such as Company Name, Drive Date, Roll Number, error messages, or exact issue encountered..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#034D35] dark:focus:ring-[#B6F596] resize-none"
                  />
                  <div className="text-right text-[11px] text-gray-400 mt-1">
                    {description.length}/2000
                  </div>
                </div>

                {/* Submit button & state */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#034D35] hover:bg-[#023826] text-white dark:bg-[#B6F596] dark:text-[#034D35] dark:hover:bg-[#a3e980] font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing & Running AI Evaluation...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit for AI Evaluation & Resolution</span>
                      </>
                    )}
                  </button>

                  {isSubmitting && submitStep && (
                    <p className="text-xs text-center text-[#034D35] dark:text-[#B6F596] font-medium mt-3 animate-pulse">
                      {submitStep}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Sidebar: AI Workflow Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#034D35] to-[#022c1e] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B6F596]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-[#B6F596] text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4" />
                How AI Resolution Works
              </div>
              <h3 className="text-lg font-bold mb-3">Automatic & Atomic Flow</h3>
              <ul className="space-y-3 text-xs text-gray-200">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#B6F596]/20 flex items-center justify-center text-[#B6F596] font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <span>
                    <strong>AI Categorization:</strong> Evaluates sentiment, priority, and formulates an instant resolution.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#B6F596]/20 flex items-center justify-center text-[#B6F596] font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <span>
                    <strong>Email Confirmation:</strong> Sends full ticket details and AI solution directly to your registered student inbox.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#B6F596]/20 flex items-center justify-center text-[#B6F596] font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <span>
                    <strong>Atomic Save:</strong> Persisted in database via transactions. If any step fails, the system rolls back cleanly.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#B6F596]/20 flex items-center justify-center text-[#B6F596] font-bold text-[10px] shrink-0 mt-0.5">
                    4
                  </div>
                  <span>
                    <strong>SuperAdmin Oversight:</strong> Visible on the administrative dashboard with priority alerts.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                Urgent Assistance Guidelines
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                For live interview emergencies (e.g., link broken or interviewer not present), select <strong>Interview Scheduling</strong> to trigger immediate Critical flag dispatch to TPO officers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLAINT HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              My Submitted Tickets ({history.length})
            </h2>
            <button
              onClick={fetchMyComplaints}
              disabled={loadingHistory}
              className="text-xs font-semibold flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-gray-400">Loading your complaint tickets...</div>
          ) : history.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <LifeBuoy className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800 dark:text-white">No complaints filed yet</h3>
              <p className="text-xs text-gray-500 mt-1">
                If you encounter any scheduling or eligibility issues, you can submit a ticket above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const isExpanded = expandedComplaintId === item._id;
                return (
                  <div
                    key={item._id}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                            #{item._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(item.priority)}`}>
                            {item.priority} Urgency
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                          {formatSafeDate(item.createdAt) && (
                            <span className="text-xs text-gray-400">
                              • {formatSafeDate(item.createdAt)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {item.subject}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Category: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.complaintType}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setExpandedComplaintId(isExpanded ? null : item._id)}
                        className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-1 text-gray-700 dark:text-gray-300"
                      >
                        {isExpanded ? "Hide Details" : "View AI Resolution"}
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Expandable details */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-800 space-y-4">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Your Submitted Details:
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                            {item.description}
                          </p>
                        </div>

                        {item.aiEvaluation && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              AI Automated Advice & Resolution:
                            </div>
                            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed whitespace-pre-wrap">
                              {item.aiEvaluation.aiReply}
                            </p>
                          </div>
                        )}

                        {item.adminNotes && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-1">
                              Placement Cell / Admin Note:
                            </div>
                            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                              {item.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RESOLVED MODAL (Shown immediately upon successful submission) */}
      {resolvedResultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setResolvedResultModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-400">
                TICKET #{resolvedResultModal._id.slice(-6).toUpperCase()}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(resolvedResultModal.priority)}`}>
                {resolvedResultModal.priority} Priority
              </span>
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1 mb-2">
              Complaint Registered & Answered
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              An official email has been delivered to your student inbox. Here is the immediate resolution generated by the AI Support Officer:
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 mb-5">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                AI Guidance & Immediate Resolution:
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed whitespace-pre-wrap font-medium">
                {resolvedResultModal.aiEvaluation?.aiReply}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/60 p-3 rounded-xl mb-6">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full copy and ticket reference dispatched to your registered email.</span>
            </div>

            <button
              onClick={() => {
                setResolvedResultModal(null);
                setActiveTab("history");
              }}
              className="w-full py-3 rounded-xl bg-[#034D35] hover:bg-[#023826] text-white dark:bg-[#B6F596] dark:text-[#034D35] font-bold text-sm transition-all"
            >
              Go to My Tickets History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSupport;
