import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckSquare,
  Search,
  ChevronDown,
  Calendar,
  Link as LinkIcon,
  Code,
  FileText,
  Phone,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import InterviewScheduleModal from "../../components/common/InterviewScheduleModal";
import useDebounce from "../../hooks/useDebounce";

const DriveApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const basePath = userRole === "HR" ? "/hr" : "/admin";
  const uiBasePath = userRole === "HR" ? "/hr" : userRole === "SUPERADMIN" ? "/superadmin" : "/admin";
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOption, setSortOption] = useState("newest");
  const [totalPages, setTotalPages] = useState(1);
  const [driveStatus, setDriveStatus] = useState("");
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const STATUSES = [
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEW_SCHEDULED",
    "HIRED",
    "REJECTED",
  ];
  const UPDATE_STATUSES = ["APPLIED", "SHORTLISTED", "HIRED", "REJECTED"];

  useEffect(() => {
    fetchApplications();
  }, [id, activeTab, debouncedSearch, page, limit, sortOption]);

  const fetchApplications = async () => {
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

      const { data } = await api.get(
        `${basePath}/job-drives/${id}/applications${queryString}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setApplications(data.data);
      if (data.pagination) setTotalPages(data.pagination.totalPages);
      if (data.driveStatus) setDriveStatus(data.driveStatus);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(
        `${basePath}/applications/${appId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Status updated");
      setApplications(
        applications.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app,
        ),
      );
      setOpenDropdownId(null); 
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkUpdate = async (newStatus) => {
    if (selectedAppIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await api.put(
        `${basePath}/applications/bulk`,
        {
          applicationIds: selectedAppIds,
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(
        `Successfully updated ${selectedAppIds.length} students to ${newStatus}`,
      );
      setApplications(
        applications.map((app) =>
          selectedAppIds.includes(app._id)
            ? { ...app, status: newStatus }
            : app,
        ),
      );
      setSelectedAppIds([]);
    } catch (error) {
      toast.error("Failed to update applications");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedAppIds.length === applications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(applications.map((app) => app._id));
    }
  };

  const toggleSelect = (appId) => {
    if (selectedAppIds.includes(appId)) {
      setSelectedAppIds(selectedAppIds.filter((id) => id !== appId));
    } else {
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

  const isDriveImmutable = [
    "CANCELLED",
    "COMPLETED",
    "DRAFT",
    "PENDING_APPROVAL",
    "REJECTED",
  ].includes(driveStatus);

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPLIED":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Applied
          </span>
        );
      case "SHORTLISTED":
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Shortlisted
          </span>
        );
      case "INTERVIEW_SCHEDULED":
        return (
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Interviewing
          </span>
        );
      case "HIRED":
        return (
          <span className="px-3 py-1 bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/20 dark:border-[#B6F596]/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Hired
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <button
          onClick={() => navigate(`${uiBasePath}/job-drives`)}
          className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-[#121212] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm self-start sm:self-auto shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight mb-1">
            Drive Applications
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage and shortlist candidates for this drive.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Tabs */}
        <div
          className="flex overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto gap-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {["ALL", ...STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => {
                setActiveTab(status);
                setSelectedAppIds([]);
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-bold transition-all shadow-sm ${
                activeTab === status
                  ? "bg-[#034D35] text-[#B6F596] dark:bg-[#B6F596] dark:text-[#034D35]"
                  : "bg-white dark:bg-slate-800 text-gray-500 hover:text-[#121212] dark:hover:text-white border border-gray-200 dark:border-slate-700"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
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
            <option value="cgpa_high">Highest CGPA</option>
            <option value="cgpa_low">Lowest CGPA</option>
            <option value="name_az">Name (A-Z)</option>
            <option value="name_za">Name (Z-A)</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search candidate..."
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

      {/* Bulk Actions Floating Bar */}
      {selectedAppIds.length > 0 && !isDriveImmutable && (
        <div className="bg-white dark:bg-slate-800 border border-[#034D35]/30 dark:border-[#B6F596]/30 rounded-[24px] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn transition-colors duration-300">
          <div className="flex items-center text-[#121212] dark:text-white font-extrabold text-sm">
            <CheckSquare
              className="text-[#034D35] dark:text-[#B6F596] mr-3"
              size={20}
            />
            {selectedAppIds.length} candidate
            {selectedAppIds.length > 1 ? "s" : ""} selected
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-1">
              Action:
            </span>
            {UPDATE_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleBulkUpdate(status)}
                disabled={isBulkUpdating}
                className="px-4 py-2 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:border-[#034D35] dark:hover:border-[#B6F596] text-[#121212] dark:text-white text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 shadow-sm"
              >
                {status.replace("_", " ")}
              </button>
            ))}

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-5 py-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] text-xs font-bold uppercase tracking-wider rounded-full flex items-center transition-colors shadow-md"
            >
              <Calendar size={14} className="mr-1.5" />
              Schedule Interviews
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[32px] overflow-x-auto w-full shadow-sm transition-colors duration-300 min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[32px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9F7F1] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-5 w-12">
                {!isDriveImmutable && (
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-[#034D35] dark:text-[#B6F596] focus:ring-[#034D35] dark:focus:ring-[#B6F596] cursor-pointer"
                    checked={
                      selectedAppIds.length === applications.length &&
                      applications.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                )}
              </th>
              <th className="px-6 py-5">Candidate Info</th>
              <th className="px-6 py-5">Academics</th>
              <th className="px-6 py-5">Portfolio</th>
              <th className="px-6 py-5">Applied Date</th>
              <th className="px-6 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {!loading && applications.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-gray-400 font-medium"
                >
                  No applications found matching your criteria.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr
                  key={app._id}
                  className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    {!isDriveImmutable && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-[#034D35] dark:text-[#B6F596] focus:ring-[#034D35] dark:focus:ring-[#B6F596] cursor-pointer"
                        checked={selectedAppIds.includes(app._id)}
                        onChange={() => toggleSelect(app._id)}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-[#121212] dark:text-white text-base">
                      {app.firstName} {app.lastName}
                    </div>
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                      {app.rollNumber}
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">
                      {app.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#121212] dark:text-gray-200">
                      {app.branch || "N/A"}
                    </div>
                    <div className="text-xs mt-1.5 font-bold flex gap-3">
                      <span className="text-[#034D35] dark:text-[#B6F596]">
                        CGPA: {app.cgpa}
                      </span>
                      <span className="text-red-500 dark:text-red-400">
                        Backlogs: {app.activeBacklogs}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 text-gray-400 dark:text-gray-500">
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#034D35] dark:hover:text-[#B6F596] transition-colors"
                          title="View Resume"
                        >
                          <FileText size={18} />
                        </a>
                      ) : (
                        <FileText
                          size={18}
                          className="opacity-30"
                          title="No Resume"
                        />
                      )}

                      {app.linkedinUrl ? (
                        <a
                          href={app.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-500 transition-colors"
                          title="LinkedIn Profile"
                        >
                          <LinkIcon size={18} />
                        </a>
                      ) : (
                        <LinkIcon
                          size={18}
                          className="opacity-30"
                          title="No LinkedIn"
                        />
                      )}

                      {app.githubUrl ? (
                        <a
                          href={app.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#121212] dark:hover:text-white transition-colors"
                          title="GitHub Profile"
                        >
                          <Code size={18} />
                        </a>
                      ) : (
                        <Code
                          size={18}
                          className="opacity-30"
                          title="No GitHub"
                        />
                      )}

                      {app.phone ? (
                        <a
                          href={`tel:${app.phone}`}
                          className="hover:text-[#034D35] dark:hover:text-[#B6F596] transition-colors"
                          title={app.phone}
                        >
                          <Phone size={18} />
                        </a>
                      ) : (
                        <Phone
                          size={18}
                          className="opacity-30"
                          title="No Phone"
                        />
                      )}
                    </div>
                    {app.skills && app.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[200px]">
                        {app.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-gray-300 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#121212] dark:text-gray-300 font-medium whitespace-nowrap">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === app._id ? null : app._id,
                          )
                        }
                        className={`flex items-center gap-1.5 rounded-full transition-transform active:scale-95 ${!isDriveImmutable ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                      >
                        {getStatusBadge(app.status)}
                        {!isDriveImmutable && (
                          <ChevronDown
                            size={14}
                            className="text-gray-400 dark:text-gray-500 shrink-0"
                          />
                        )}
                      </button>

                      {/* Dropdown Menu */}
                      {!isDriveImmutable && openDropdownId === app._id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdownId(null)}
                          ></div>

                          <div className="absolute top-full right-0 sm:left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[16px] shadow-xl z-20 py-2 animate-fadeIn">
                            <div className="px-4 pb-2 mb-2 border-b border-gray-100 dark:border-slate-700/50">
                              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Update Status
                              </p>
                            </div>
                            {UPDATE_STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(app._id, s)}
                                className={`w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                                  app.status === s
                                    ? "text-[#034D35] dark:text-[#B6F596] bg-[#B6F596]/10 dark:bg-[#034D35]/20"
                                    : "text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {s.replace("_", " ")}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
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
            className="mx-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] font-bold shadow-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>applications per page</span>
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

      {/* Schedule Interviews Modal */}
      <InterviewScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        selectedStudents={applications.filter((app) =>
          selectedAppIds.includes(app._id),
        )}
        jobDriveId={id}
        basePath={basePath}
        onSuccess={() => {
          fetchApplications();
          setSelectedAppIds([]);
        }}
      />
    </div>
  );
};

export default DriveApplications;
