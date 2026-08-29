import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import useDebounce from "../../hooks/useDebounce";

const JobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, ACTIVE, DRAFT, CLOSED
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectDriveId, setRejectDriveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [viewDrive, setViewDrive] = useState(null);

  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const basePath = userRole === "SUPERADMIN" ? "/superadmin" : "/admin";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("newest");
  const debouncedSearch = useDebounce(searchTerm, 1000);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchDrives = async () => {
    try {
      setLoading(true);
      let queryString = `?page=${page}&limit=${limit}`;
      queryString += `&sort=${sortOption}`;

      if (activeTab && activeTab !== "ALL") {
        queryString += `&status=${activeTab}`;
      }

      if (debouncedSearch) {
        queryString += `&search=${debouncedSearch}`;
      }

      const response = await api.get(
        `/admin/job-drives${queryString}`,
        getAuthHeader(),
      );
      setDrives(response.data.data);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Failed to fetch job drives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [page, limit, activeTab, debouncedSearch, sortOption]);
  const handleStatusUpdate = async (id, newStatus) => {
    if (
      newStatus === "CANCELLED" &&
      !window.confirm(
        "Are you sure you want to cancel this drive? This will notify scheduled students.",
      )
    )
      return;
    if (newStatus === "REJECTED") {
      setRejectDriveId(id);
      setRejectionReason("");
      setIsRejectModalOpen(true);
      return;
    }

    try {
      await api.put(
        `/admin/job-drives/${id}`,
        { status: newStatus },
        getAuthHeader(),
      );
      toast.success(`Job drive marked as ${newStatus}`);
      fetchDrives();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await api.put(
        `/admin/job-drives/${rejectDriveId}`,
        { status: "REJECTED", rejectionReason },
        getAuthHeader(),
      );
      toast.success("Job drive marked as REJECTED");
      setIsRejectModalOpen(false);
      setRejectDriveId(null);
      setRejectionReason("");
      fetchDrives();
    } catch (error) {
      toast.error("Failed to reject job drive");
    }
  };

  const handleCompleteDrive = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to mark this drive as COMPLETED?\n\nAny remaining applicants in the APPLIED or SHORTLISTED stages will be automatically marked as REJECTED and notified.",
      )
    )
      return;
    try {
      const response = await api.put(
        `/admin/job-drives/${id}/complete`,
        {},
        getAuthHeader(),
      );
      toast.success(
        `Job drive marked as COMPLETED. Auto-rejected ${response.data.autoRejectedCount || 0} pending applicants.`,
      );
      fetchDrives();
    } catch (error) {
      toast.error("Failed to complete job drive");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/20 dark:border-[#B6F596]/20">
            Active
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
            Pending
          </span>
        );
      case "REJECTED":
      case "CANCELLED":
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
            {status}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {status}
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
            Job Drives
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage campus placement drives, eligibility, and rounds.
          </p>
        </div>
        <button
          onClick={() => navigate(`${basePath}/job-drives/create`)}
          className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-2.5 px-6 rounded-full shadow-md transition-all text-sm shrink-0 whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Create New Drive</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div
          className="flex overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto gap-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {[
            "ALL",
            "ACTIVE",
            "PENDING_APPROVAL",
            "REJECTED",
            "DRAFT",
            "COMPLETED",
            "CANCELLED",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-bold transition-all shadow-sm ${
                activeTab === tab
                  ? "bg-[#034D35] text-[#B6F596] dark:bg-[#B6F596] dark:text-[#034D35]"
                  : "bg-white dark:bg-slate-800 text-gray-500 hover:text-[#121212] dark:hover:text-white border border-gray-200 dark:border-slate-700"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white px-5 py-2.5 text-xs font-bold rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline_soon">Ending Soonest</option>
            <option value="deadline_late">Ending Latest</option>
            <option value="salary_high">Highest Salary</option>
            <option value="salary_low">Lowest Salary</option>
            <option value="title_az">Title (A-Z)</option>
            <option value="title_za">Title (Z-A)</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white pl-10 pr-4 py-2.5 rounded-full text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[32px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
          </div>
        )}
        <div className="flex-1 pb-4 flex flex-col min-h-[400px]">
          {!loading && drives.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="w-20 h-20 rounded-full bg-[#F9F7F1] dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-slate-700">
                <Briefcase className="w-10 h-10 opacity-50" />
              </div>
              <p className="text-lg font-bold text-[#121212] dark:text-white mb-2">
                No job drives found.
              </p>
              <button
                onClick={() => navigate(`${basePath}/job-drives/create`)}
                className="mt-2 text-[#034D35] dark:text-[#B6F596] font-bold hover:underline"
              >
                Create the first one
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drives.map((drive) => (
                <div
                  key={drive._id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[24px] p-6 hover:border-[#034D35]/50 dark:hover:border-[#B6F596]/50 transition-all group flex flex-col shadow-sm"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center space-x-4">
                      {drive.companyId?.logoUrl ? (
                        <div className="w-12 h-12 rounded-[14px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                          <img
                            src={drive.companyId.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-[14px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                          <Building2 size={20} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-extrabold text-[#121212] dark:text-white group-hover:text-[#034D35] dark:group-hover:text-[#B6F596] transition-colors line-clamp-1">
                          {drive.title}
                        </h3>
                        <div className="flex flex-col mt-1 gap-0.5">
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-bold">
                            {drive.companyId?.name ||
                              drive.companyName ||
                              "Company"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      <Briefcase
                        size={16}
                        className="mr-3 text-gray-400 dark:text-gray-500"
                      />
                      Role:{" "}
                      <span className="font-bold text-[#121212] dark:text-white ml-1">
                        {drive.jobRole}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      <MapPin
                        size={16}
                        className="mr-3 text-gray-400 dark:text-gray-500"
                      />
                      {drive.location || "Not Specified"}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      <Calendar
                        size={16}
                        className="mr-3 text-gray-400 dark:text-gray-500"
                      />
                      Deadline:{" "}
                      <span className="font-bold text-[#121212] dark:text-white ml-1">
                        {new Date(drive.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4 pt-5 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <div className="text-base font-extrabold text-[#034D35] dark:text-[#B6F596]">
                        ₹{drive.packageLPA} LPA
                      </div>
                      {getStatusBadge(drive.status)}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex gap-2">
                        {drive.status === "PENDING_APPROVAL" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(drive._id, "ACTIVE")
                              }
                              title="Approve"
                              className="p-2 rounded-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[#034D35] hover:bg-[#B6F596]/20 dark:text-[#B6F596] dark:hover:bg-[#034D35]/30 transition-colors shadow-sm"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(drive._id, "REJECTED")
                              }
                              title="Reject"
                              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {drive.status === "ACTIVE" && (
                          <>
                            {new Date(drive.deadline) < new Date() && (
                              <button
                                onClick={() => handleCompleteDrive(drive._id)}
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800/50"
                              >
                                Mark Completed
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleStatusUpdate(drive._id, "CANCELLED")
                              }
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800/50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewDrive(drive)}
                          className="p-2 rounded-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-[#034D35] hover:border-[#034D35] dark:hover:text-[#B6F596] dark:hover:border-[#B6F596] transition-colors shadow-sm"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `${basePath}/job-drives/${drive._id}/applications`,
                            )
                          }
                          disabled={["PENDING_APPROVAL", "REJECTED"].includes(
                            drive.status,
                          )}
                          className={`p-2 rounded-full border shadow-sm transition-colors ${
                            ["PENDING_APPROVAL", "REJECTED"].includes(
                              drive.status,
                            )
                              ? "bg-gray-50 border-gray-200 text-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-600 cursor-not-allowed"
                              : "bg-[#F9F7F1] dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-500 hover:text-blue-500 hover:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400"
                          }`}
                          title={
                            ["PENDING_APPROVAL", "REJECTED"].includes(
                              drive.status,
                            )
                              ? "No applications available"
                              : "View Applications"
                          }
                        >
                          <Users size={16} />
                        </button>
                        {![
                          "ACTIVE",
                          "APPROVED",
                          "COMPLETED",
                          "CANCELLED",
                          "REJECTED",
                        ].includes(drive.status) && (
                          <button
                            onClick={() =>
                              navigate(`${basePath}/job-drives/edit/${drive._id}`)
                            }
                            className="p-2 rounded-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-[#034D35] hover:border-[#034D35] dark:hover:text-[#B6F596] dark:hover:border-[#B6F596] transition-colors shadow-sm"
                            title="Edit Drive"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={54}>54</option>
          </select>
          <span>cards per page</span>
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

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] border border-gray-200 dark:border-slate-700 w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn transition-colors duration-300">
            <div className="p-6">
              <h3 className="text-xl font-extrabold text-[#121212] dark:text-white mb-1.5 flex items-center">
                <Trash2 className="text-red-500 mr-2" size={20} />
                Reject Job Drive
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-5">
                Please provide a reason for rejecting this job drive. This
                feedback will be emailed to the HR so they can make corrections.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please increase the salary package and fix typos..."
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 h-32 resize-none text-sm font-medium shadow-sm transition-all"
                required
              />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectDriveId(null);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-md transition-all text-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col max-h-[90vh] animate-slide-up transition-colors duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-[#F9F7F1] dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-4">
                {viewDrive.companyId?.logoUrl ? (
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700 shadow-sm shrink-0 p-1">
                    <img
                      src={viewDrive.companyId.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#034D35] dark:text-[#B6F596] border border-gray-200 dark:border-slate-700 shadow-sm shrink-0">
                    <Building2 size={24} />
                  </div>
                )}
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-[#121212] dark:text-white flex items-center gap-3">
                    {viewDrive.title}
                    {getStatusBadge(viewDrive.status)}
                  </h3>
                  <div className="flex flex-wrap items-center text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 gap-4 uppercase tracking-wider">
                    <span className="flex items-center">
                      <Building2 size={12} className="mr-1.5" />
                      {viewDrive.companyId?.name || viewDrive.companyName}
                    </span>
                    {viewDrive.postedByHR?.email && (
                      <span className="flex items-center lowercase">
                        <Users size={12} className="mr-1.5 uppercase" />
                        {viewDrive.postedByHR.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-4 rounded-[20px] shadow-sm">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">
                    Role
                  </p>
                  <p
                    className="font-extrabold text-[#121212] dark:text-white truncate"
                    title={viewDrive.jobRole}
                  >
                    {viewDrive.jobRole}
                  </p>
                </div>
                <div className="bg-[#B6F596]/10 dark:bg-[#034D35]/20 border border-[#034D35]/10 dark:border-[#B6F596]/20 p-4 rounded-[20px] shadow-sm">
                  <p className="text-[10px] text-[#034D35] dark:text-[#B6F596] mb-1 uppercase font-bold tracking-wider">
                    Package
                  </p>
                  <p className="font-extrabold text-[#034D35] dark:text-[#B6F596]">
                    ₹{viewDrive.packageLPA} LPA
                  </p>
                </div>
                <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-4 rounded-[20px] shadow-sm">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">
                    Location
                  </p>
                  <p
                    className="font-extrabold text-[#121212] dark:text-white truncate"
                    title={viewDrive.location}
                  >
                    {viewDrive.location}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-[20px] shadow-sm">
                  <p className="text-[10px] text-red-500 dark:text-red-400 mb-1 uppercase font-bold tracking-wider">
                    Deadline
                  </p>
                  <p className="font-extrabold text-red-600 dark:text-red-400">
                    {new Date(viewDrive.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-extrabold text-[#121212] dark:text-white mb-4 flex items-center border-b border-gray-100 dark:border-slate-700 pb-2">
                  <Briefcase
                    className="mr-2 text-[#034D35] dark:text-[#B6F596]"
                    size={16}
                  />
                  Description
                </h4>
                <div className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed whitespace-pre-wrap bg-[#F9F7F1] dark:bg-slate-900 p-5 rounded-[20px] border border-gray-200 dark:border-slate-700/50 shadow-inner">
                  {viewDrive.description}
                </div>
                {viewDrive.jdFileUrl && (
                  <div className="mt-4">
                    <a
                      href={viewDrive.jdFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] hover:opacity-80 border border-[#034D35]/20 dark:border-[#B6F596]/20 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                    >
                      <Briefcase size={14} />
                      <span>View Official JD Document (PDF)</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Eligibility */}
              <div>
                <h4 className="text-sm font-extrabold text-[#121212] dark:text-white mb-4 flex items-center border-b border-gray-100 dark:border-slate-700 pb-2">
                  <Users
                    className="mr-2 text-blue-500 dark:text-blue-400"
                    size={16}
                  />
                  Eligibility Criteria
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-200 dark:border-slate-700/50 shadow-sm flex flex-col">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
                      Min CGPA
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {viewDrive.minCgpa}
                    </span>
                  </div>
                  <div className="bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-200 dark:border-slate-700/50 shadow-sm flex flex-col">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
                      Max Backlogs
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {viewDrive.maxBacklogs}
                    </span>
                  </div>
                  <div className="bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-200 dark:border-slate-700/50 shadow-sm flex flex-col">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
                      Passout Year
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {viewDrive.passoutYear}
                    </span>
                  </div>
                </div>
                {viewDrive.eligibleBranches &&
                  viewDrive.eligibleBranches.length > 0 && (
                    <div className="mt-4 bg-[#F9F7F1] dark:bg-slate-900 p-5 rounded-[20px] border border-gray-200 dark:border-slate-700/50 shadow-sm">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider block mb-3">
                        Eligible Branches
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {viewDrive.eligibleBranches.map((b) => (
                          <span
                            key={b}
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Rounds */}
              {viewDrive.rounds && viewDrive.rounds.length > 0 && (
                <div>
                  <h4 className="text-sm font-extrabold text-[#121212] dark:text-white mb-4 flex items-center border-b border-gray-100 dark:border-slate-700 pb-2">
                    <Calendar
                      className="mr-2 text-purple-500 dark:text-purple-400"
                      size={16}
                    />
                    Selection Rounds
                  </h4>
                  <div className="space-y-4">
                    {viewDrive.rounds.map((round, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F9F7F1] dark:bg-slate-900 p-5 rounded-[20px] border border-gray-200 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row md:items-start gap-4"
                      >
                        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 w-10 h-10 rounded-full flex items-center justify-center font-extrabold shrink-0 shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="mt-1">
                          <p className="font-extrabold text-[#121212] dark:text-white text-base">
                            {round.name}
                          </p>
                          {round.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 font-medium leading-relaxed">
                              {round.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end bg-[#F9F7F1] dark:bg-slate-900 shrink-0">
              <button
                onClick={() => setViewDrive(null)}
                className="px-6 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-[#121212] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-bold text-sm shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDrives;
