import React, { useState, useEffect } from "react";
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import useDebounce from "../../hooks/useDebounce";

const NotificationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);

  const [activeStatus, setActiveStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let queryString = `?page=${page}&limit=${limit}&sort=${sortOption}&status=${activeStatus}`;
      if (debouncedSearch) {
        queryString += `&search=${debouncedSearch}`;
      }
      if (selectedType !== "ALL") {
        queryString += `&type=${selectedType}`;
      }

      const response = await api.get(
        `/admin/notifications${queryString}`,
        getAuthHeader(),
      );
      setLogs(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalDocuments(response.data.pagination.totalDocuments);
      }
    } catch (error) {
      toast.error("Failed to fetch notification logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, sortOption, activeStatus, selectedType, debouncedSearch]);

  const handleResend = async (id) => {
    try {
      setResendingId(id);
      const response = await api.post(
        `/admin/notifications/${id}/resend`,
        {},
        getAuthHeader(),
      );
      toast.success(response.data.message || "Email resent successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend email");
    } finally {
      setResendingId(null);
      fetchLogs();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="px-3 py-1 bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/20 dark:border-[#B6F596]/20 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center">
            <CheckCircle2 size={12} className="mr-1.5" /> Delivered
          </span>
        );
      case "FAILED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center">
            <AlertCircle size={12} className="mr-1.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center">
            <Clock size={12} className="mr-1.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight mb-2">
            Notification Logs
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Monitor system emails ({totalDocuments} total logs), search by recipient or mail type, and sort by
            date.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Status Tabs */}
        <div
          className="flex overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto gap-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {["ALL", "DELIVERED", "FAILED", "PENDING"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setActiveStatus(status);
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-bold transition-all shadow-sm ${
                activeStatus === status
                  ? "bg-[#034D35] text-[#B6F596] dark:bg-[#B6F596] dark:text-[#034D35]"
                  : "bg-white dark:bg-slate-800 text-gray-500 hover:text-[#121212] dark:hover:text-white border border-gray-200 dark:border-slate-700"
              }`}
            >
              {status === "ALL" ? "All Logs" : status}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white px-5 py-2.5 text-xs font-bold rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all cursor-pointer"
          >
            <option value="ALL">All Event Types</option>
            <option value="WELCOME">Welcome / Setup</option>
            <option value="HR_ACTIVATION">HR Activation</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="REASSIGNED">Slot Reassigned</option>
            <option value="INTERVIEW_CANCELLED">Interview Cancelled</option>
            <option value="APPLICATION_SHORTLISTED">Shortlisted</option>
            <option value="APPLICATION_HIRED">Hired / Offer</option>
            <option value="APPLICATION_REJECTED">Application Rejected</option>
            <option value="GENERAL">General Notice</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white px-5 py-2.5 text-xs font-bold rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all cursor-pointer"
          >
            <option value="newest">Date: Newest First</option>
            <option value="oldest">Date: Oldest First</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search recipient or subject..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white pl-10 pr-4 py-2.5 rounded-full text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[32px] overflow-x-auto w-full shadow-sm transition-colors duration-300 min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[32px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
          </div>
        )}
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-[#F9F7F1] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-5 w-[25%]">Recipient</th>
              <th className="px-6 py-5 w-[30%]">Subject & Event</th>
              <th className="px-6 py-5 w-[20%]">Date & Time</th>
              <th className="px-6 py-5 w-[15%]">Status</th>
              <th className="px-6 py-5 w-[10%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {!loading && logs.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium"
                >
                  <div className="w-16 h-16 rounded-full bg-[#F9F7F1] dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-slate-700">
                    <Mail className="w-8 h-8 opacity-50" />
                  </div>
                  No email notification logs found matching your criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log._id}
                  className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div
                      className="font-extrabold text-[#121212] dark:text-white truncate max-w-[200px]"
                      title={log.recipientEmail}
                    >
                      {log.recipientEmail}
                    </div>
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                      Attempt: {log.attempts}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="font-bold text-[#121212] dark:text-gray-200 truncate max-w-[250px]"
                      title={log.subject}
                    >
                      {log.subject}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-[#F9F7F1] dark:bg-slate-900 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-700 inline-block">
                        {log.type.replace(/_/g, " ")}
                      </span>
                      {log.errorMessage && (
                        <span
                          className="text-[10px] font-bold text-red-500 truncate max-w-[150px]"
                          title={log.errorMessage}
                        >
                          • Error: {log.errorMessage}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-[#121212] dark:text-white text-sm">
                      {new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleResend(log._id)}
                      disabled={resendingId === log._id}
                      className="p-2.5 rounded-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-[#034D35] hover:border-[#034D35] dark:hover:text-[#B6F596] dark:hover:border-[#B6F596] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Resend Email"
                    >
                      <RefreshCw
                        size={16}
                        className={
                          resendingId === log._id
                            ? "animate-spin text-[#034D35] dark:text-[#B6F596]"
                            : ""
                        }
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 md:p-6 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm w-full">
        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
          <span>Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="mx-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] font-bold shadow-sm cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>logs per page</span>
        </div>

        <div className="flex items-center space-x-4 text-sm font-bold text-gray-500 dark:text-gray-400">
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-full border shadow-sm transition-colors ${
                page === 1
                  ? "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                  : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-[#121212] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className={`px-4 py-2 rounded-full border shadow-sm transition-colors ${
                page === totalPages || totalPages === 0
                  ? "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-400 cursor-not-allowed"
                  : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-[#121212] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationLogs;
