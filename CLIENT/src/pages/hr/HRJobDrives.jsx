import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  Users,
  X,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import useDebounce from "../../hooks/useDebounce";

const HRJobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, ACTIVE, PENDING_APPROVAL, REJECTED, DRAFT, COMPLETED, CANCELLED
  const [viewDrive, setViewDrive] = useState(null);
  const navigate = useNavigate();

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
        `/hr/job-drives${queryString}`,
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

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job drive? This action cannot be undone.",
      )
    )
      return;
    try {
      await api.delete(`/hr/job-drives/${id}`, getAuthHeader());
      toast.success("Job drive deleted successfully");
      fetchDrives();
    } catch (error) {
      toast.error("Failed to delete job drive");
    }
  };

  const _handleStatusUpdate = async (id, newStatus) => {
    if (
      newStatus === "CANCELLED" &&
      !window.confirm(
        "Are you sure you want to cancel this drive? This will notify scheduled students.",
      )
    )
      return;
    try {
      await api.put(
        `/hr/job-drives/${id}`,
        { status: newStatus },
        getAuthHeader(),
      );
      toast.success(`Job drive marked as ${newStatus}`);
      fetchDrives();
    } catch (error) {
      toast.error("Failed to update status");
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
        `/hr/job-drives/${id}/complete`,
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/20 dark:border-[#B6F596]/20";
      case "PENDING_APPROVAL":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50";
      default: 
        return "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border border-gray-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white mb-2 tracking-tight">
            Job Drives
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage campus placement drives, review applicants, and track
            selection rounds.
          </p>
        </div>
        <button
          onClick={() => navigate("/hr/job-drives/create")}
          className="bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-3 px-6 rounded-full shadow-md transition-all flex items-center justify-center gap-2 text-sm shrink-0"
        >
          <Plus size={18} />
          <span>Create New Drive</span>
        </button>
      </div>

      {/* Toolbar (Filters & Search) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Tabs */}
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

        {/* Sort & Search */}
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
              placeholder="Search drives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white pl-10 pr-4 py-2.5 rounded-full text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="relative flex flex-col w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F9F7F1]/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[32px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
          </div>
        )}

        <div className="w-full">
          {!loading && drives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-sm">
              <Briefcase className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-bold text-[#121212] dark:text-white">
                No job drives found.
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                Adjust your filters or try a different search.
              </p>
              <button
                onClick={() => navigate("/hr/job-drives/create")}
                className="mt-6 text-sm font-bold text-[#034D35] dark:text-[#B6F596] hover:underline bg-[#B6F596]/20 dark:bg-[#034D35]/30 px-6 py-2.5 rounded-full flex items-center gap-2"
              >
                <Plus size={16} /> Create the first one
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drives.map((drive) => (
                <div
                  key={drive._id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[32px] p-6 sm:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      {drive.companyId?.logoUrl ? (
                        <div className="w-14 h-14 rounded-[16px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center p-2 shrink-0 shadow-sm">
                          <img
                            src={drive.companyId.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-[16px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-gray-400 shadow-sm">
                          <Building2 size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-extrabold text-[#121212] dark:text-white leading-snug">
                          {drive.title}
                        </h3>
                        <div className="text-[#034D35] dark:text-[#B6F596] text-xs font-bold uppercase tracking-wider mt-1">
                          {drive.companyId?.name ||
                            drive.companyName ||
                            "Company"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {drive.status === "REJECTED" && drive.rejectionReason && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-4 rounded-[20px]">
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <AlertCircle size={14} /> Rejection Reason
                      </p>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 leading-relaxed">
                        {drive.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      <Briefcase
                        size={16}
                        className="mr-2 text-gray-400 dark:text-gray-500"
                      />
                      <span className="font-bold text-[#121212] dark:text-white mr-1.5">
                        Role:
                      </span>{" "}
                      {drive.jobRole}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      <MapPin
                        size={16}
                        className="mr-2 text-gray-400 dark:text-gray-500"
                      />
                      {drive.location || "Not Specified"}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      <Calendar
                        size={16}
                        className="mr-2 text-gray-400 dark:text-gray-500"
                      />
                      Deadline: {new Date(drive.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4 pt-5 border-t border-gray-100 dark:border-slate-700/80">
                    <div className="flex justify-between items-center">
                      <div className="text-base font-extrabold text-[#121212] dark:text-white">
                        ₹{drive.packageLPA} LPA
                      </div>
                      <div
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${getStatusStyle(drive.status)}`}
                      >
                        {drive.status.replace("_", " ")}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Text Action Buttons */}
                      <div className="flex gap-2 justify-end">
                        {drive.status === "ACTIVE" &&
                          new Date(drive.deadline) < new Date() && (
                            <button
                              onClick={() => handleCompleteDrive(drive._id)}
                              className="px-4 py-2 text-xs font-bold rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm"
                            >
                              Mark Completed
                            </button>
                          )}
                        {(drive.status === "ACTIVE" ||
                          drive.status === "PENDING_APPROVAL") && (
                          <button
                            onClick={() => handleDelete(drive._id)}
                            className="px-4 py-2 text-xs font-bold rounded-full bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                          >
                            Cancel Drive
                          </button>
                        )}
                      </div>

                      {/* Icon Action Buttons */}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setViewDrive(drive)}
                          className="p-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-[#121212] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors shadow-sm"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/hr/job-drives/${drive._id}/applications`)
                          }
                          disabled={[
                            "PENDING_APPROVAL",
                            "DRAFT",
                            "CANCELLED",
                          ].includes(drive.status)}
                          className={`p-3 rounded-full border shadow-sm transition-colors ${
                            ["PENDING_APPROVAL", "DRAFT", "CANCELLED"].includes(
                              drive.status,
                            )
                              ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 cursor-not-allowed"
                              : "bg-[#F9F7F1] dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-[#034D35] dark:text-[#B6F596] hover:bg-[#B6F596]/20 dark:hover:bg-[#034D35]/30"
                          }`}
                          title={
                            ["PENDING_APPROVAL", "DRAFT", "CANCELLED"].includes(
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
                              navigate(`/hr/job-drives/edit/${drive._id}`)
                            }
                            className="p-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-[#034D35] dark:hover:text-[#B6F596] hover:bg-[#B6F596]/20 dark:hover:bg-[#034D35]/30 rounded-full transition-colors shadow-sm"
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
            className="mx-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] font-bold shadow-sm"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={54}>54</option>
          </select>
          <span>drives per page</span>
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

      {/* View Details Modal Overlay */}
      {viewDrive && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up transition-colors duration-300">
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-gray-200 dark:border-slate-700 bg-[#F9F7F1] dark:bg-slate-900 flex justify-between items-start transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                {viewDrive.companyId?.logoUrl ? (
                  <div className="w-16 h-16 rounded-[18px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center p-2 shrink-0 shadow-sm">
                    <img
                      src={viewDrive.companyId.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-[18px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                    <Building2 size={28} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#121212] dark:text-white leading-tight mb-2">
                    {viewDrive.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {viewDrive.companyId?.name || viewDrive.companyName}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(viewDrive.status)}`}
                    >
                      {viewDrive.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewDrive(null)}
                className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-4 rounded-[20px] border border-gray-100 dark:border-slate-700/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Role
                  </p>
                  <p className="font-extrabold text-[#121212] dark:text-white text-sm">
                    {viewDrive.jobRole}
                  </p>
                </div>
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-4 rounded-[20px] border border-gray-100 dark:border-slate-700/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Package
                  </p>
                  <p className="font-extrabold text-[#034D35] dark:text-[#B6F596] text-sm">
                    ₹{viewDrive.packageLPA} LPA
                  </p>
                </div>
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-4 rounded-[20px] border border-gray-100 dark:border-slate-700/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Location
                  </p>
                  <p className="font-extrabold text-[#121212] dark:text-white text-sm">
                    {viewDrive.location}
                  </p>
                </div>
                <div className="bg-[#F9F7F1] dark:bg-slate-900/50 p-4 rounded-[20px] border border-gray-100 dark:border-slate-700/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Deadline
                  </p>
                  <p className="font-extrabold text-red-600 dark:text-red-400 text-sm">
                    {new Date(viewDrive.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-[#121212] dark:text-white mb-4 flex items-center">
                  <Briefcase
                    className="mr-2 text-[#034D35] dark:text-[#B6F596]"
                    size={20}
                  />
                  Description
                </h4>
                <div className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed whitespace-pre-wrap bg-[#F9F7F1] dark:bg-slate-900/50 p-6 rounded-[24px] border border-gray-100 dark:border-slate-700/50">
                  {viewDrive.description}
                </div>
                {viewDrive.jdFileUrl && (
                  <div className="mt-4">
                    <a
                      href={viewDrive.jdFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full text-xs font-bold text-[#121212] dark:text-white transition-all shadow-sm"
                    >
                      <BookOpen
                        size={16}
                        className="text-[#034D35] dark:text-[#B6F596]"
                      />
                      <span>View Official JD Document (PDF)</span>
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-[#121212] dark:text-white mb-4 flex items-center">
                  <Users className="mr-2 text-blue-500" size={20} />
                  Eligibility Criteria
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center text-sm shadow-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">
                      Min CGPA
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {viewDrive.minCgpa}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center text-sm shadow-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">
                      Max Backlogs
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {viewDrive.maxBacklogs}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center text-sm shadow-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">
                      Passout Year
                    </span>
                    <span className="text-[#121212] dark:text-white font-extrabold">
                      {viewDrive.passoutYear}
                    </span>
                  </div>
                </div>
                {viewDrive.eligibleBranches &&
                  viewDrive.eligibleBranches.length > 0 && (
                    <div className="mt-4 bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm">
                      <span className="text-gray-500 dark:text-gray-400 text-xs block mb-3 font-bold uppercase tracking-wider">
                        Eligible Branches
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {viewDrive.eligibleBranches.map((b) => (
                          <span
                            key={b}
                            className="bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-gray-200 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-slate-700"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {viewDrive.rounds && viewDrive.rounds.length > 0 && (
                <div>
                  <h4 className="text-lg font-extrabold text-[#121212] dark:text-white mb-4 flex items-center">
                    <Calendar className="mr-2 text-indigo-500" size={20} />
                    Selection Rounds
                  </h4>
                  <div className="space-y-3">
                    {viewDrive.rounds.map((round, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center shadow-sm"
                      >
                        <div className="bg-[#F9F7F1] dark:bg-slate-900 text-[#034D35] dark:text-[#B6F596] w-10 h-10 rounded-full flex items-center justify-center font-extrabold mr-4 mb-3 md:mb-0 shrink-0 border border-gray-200 dark:border-slate-700">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#121212] dark:text-white text-base">
                            {round.name}
                          </p>
                          {round.description && (
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
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

            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end bg-white dark:bg-slate-800 rounded-b-[32px] transition-colors duration-300">
              <button
                onClick={() => setViewDrive(null)}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#F9F7F1] dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 text-[#121212] dark:text-white border border-gray-200 dark:border-slate-600 transition-colors font-bold text-sm shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRJobDrives;
