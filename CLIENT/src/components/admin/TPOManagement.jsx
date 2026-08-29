import { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Edit2,
  Lock,
  Unlock,
  Mail,
  Phone,
  Eye,
  User as UserIcon,
  Search,
  Save,
  X,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import useDebounce from "../../hooks/useDebounce";

const TPOManagement = () => {
  const [tpos, setTpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOption, setSortOption] = useState("newest");
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTpo, setCurrentTpo] = useState(null);
  const [viewingTpo, setViewingTpo] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchTPOs = async () => {
    setLoading(true);
    try {
      let queryString = `?page=${page}&limit=${limit}&status=${activeTab}&sort=${sortOption}`;
      if (debouncedSearch) {
        queryString += `&search=${debouncedSearch}`;
      }
      const response = await api.get(
        `/superadmin/tpos${queryString}`,
        getAuthHeader(),
      );
      setTpos(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      }
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error("Failed to fetch TPOs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTPOs();
  }, [activeTab, debouncedSearch, page, limit, sortOption]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/superadmin/tpos", formData, getAuthHeader());
      toast.success("TPO created. Setup email sent.");
      setIsAddModalOpen(false);
      setFormData({ name: "", email: "", phone: "" });
      fetchTPOs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create TPO");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(
        `/superadmin/tpos/${currentTpo.id}`,
        { name: formData.name, phone: formData.phone },
        getAuthHeader(),
      );
      toast.success("TPO updated successfully");
      setIsEditModalOpen(false);
      setCurrentTpo(null);
      fetchTPOs();
    } catch (error) {
      toast.error("Failed to update TPO");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (tpo) => {
    setCurrentTpo(tpo);
    setFormData({ name: tpo.name, email: tpo.email, phone: tpo.phone || "" });
    setIsEditModalOpen(true);
  };

  const handleViewTpo = async (tpo) => {
    loadingView ? null : setLoadingView(true);
    setIsViewModalOpen(true);
    try {
      const response = await api.get(
        `/superadmin/tpos/${tpo.id}`,
        getAuthHeader(),
      );
      setViewingTpo(response.data.data);
    } catch (error) {
      toast.error("Failed to load TPO details");
      setIsViewModalOpen(false);
    } finally {
      setLoadingView(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (currentStatus === "PENDING") {
      toast.error("Cannot toggle status of a PENDING TPO.");
      return;
    }
    const action = currentStatus === "ACTIVE" ? "deactivate" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${action} this TPO?`)) return;

    try {
      await api.put(
        `/superadmin/tpos/${id}/toggle-status`,
        {},
        getAuthHeader(),
      );
      toast.success(`TPO successfully ${action}d`);
      fetchTPOs();
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-3 py-1 bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/20 dark:border-[#B6F596]/20 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center">
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center">
            Pending Setup
          </span>
        );
      case "INACTIVE":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center">
            Inactive
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center">
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
            TPO Management
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Onboard, monitor, and manage Training and Placement Officers.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: "", email: "", phone: "" });
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-2.5 px-6 rounded-full shadow-md transition-all text-sm shrink-0 whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Add New TPO</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Total TPOs",
            value: stats.total,
            icon: (
              <Shield className="text-blue-600 dark:text-blue-400" size={22} />
            ),
            iconBg:
              "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50",
          },
          {
            label: "Active Officers",
            value: stats.active,
            icon: (
              <Unlock
                className="text-[#034D35] dark:text-[#B6F596]"
                size={22}
              />
            ),
            iconBg:
              "bg-[#B6F596]/40 dark:bg-[#034D35]/50 border-[#034D35]/20 dark:border-[#B6F596]/20",
          },
          {
            label: "Pending Setup",
            value: stats.pending,
            icon: (
              <Lock className="text-amber-600 dark:text-amber-400" size={22} />
            ),
            iconBg:
              "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-gray-200 dark:border-slate-700 flex items-center justify-between shadow-sm transition-colors duration-300"
          >
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {stat.label}
              </p>
              <h3 className="text-3xl font-extrabold text-[#121212] dark:text-white">
                {stat.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-[16px] flex items-center justify-center border ${stat.iconBg}`}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Status Tabs */}
        <div
          className="flex overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto gap-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {["ALL", "ACTIVE", "PENDING", "INACTIVE"].map((tab) => (
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
              {tab === "ALL" ? "All TPOs" : tab.replace("_", " ")}
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
            <option value="name_az">Name (A-Z)</option>
            <option value="name_za">Name (Z-A)</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search name, email, phone..."
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
              <th className="px-6 py-5">TPO Officer</th>
              <th className="px-6 py-5">Contact Details</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {!loading && tpos.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium"
                >
                  <div className="w-16 h-16 rounded-full bg-[#F9F7F1] dark:bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-slate-700">
                    <Shield className="w-8 h-8 opacity-50" />
                  </div>
                  No TPO officers found matching your criteria.
                </td>
              </tr>
            ) : (
              tpos.map((tpo) => (
                <tr
                  key={tpo.id}
                  className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#B6F596]/40 dark:bg-[#034D35]/50 border border-[#034D35]/20 dark:border-[#B6F596]/20 flex items-center justify-center text-[#034D35] dark:text-[#B6F596] font-extrabold text-sm shrink-0">
                        {tpo.name ? tpo.name.charAt(0).toUpperCase() : "T"}
                      </div>
                      <div>
                        <p className="font-extrabold text-[#121212] dark:text-white text-base">
                          {tpo.name}
                        </p>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wider">
                          Added by {tpo.createdBy}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="flex items-center font-bold text-[#034D35] dark:text-[#B6F596] truncate max-w-[220px]">
                        <Mail
                          size={14}
                          className="mr-2 shrink-0 text-gray-400"
                        />{" "}
                        {tpo.email}
                      </span>
                      {tpo.phone && (
                        <span className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                          <Phone
                            size={14}
                            className="mr-2 shrink-0 text-gray-400"
                          />{" "}
                          {tpo.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(tpo.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewTpo(tpo)}
                        className="p-2 rounded-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-[#121212] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(tpo)}
                        className="p-2 rounded-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors shadow-sm"
                        title="Edit Details"
                      >
                        <Edit2 size={16} />
                      </button>
                      {tpo.status !== "PENDING" && (
                        <button
                          onClick={() => handleToggleStatus(tpo.id, tpo.status)}
                          className={`p-2 rounded-full border shadow-sm transition-colors ${
                            tpo.status === "ACTIVE"
                              ? "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "bg-[#F9F7F1] dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-[#034D35] hover:bg-[#B6F596]/20 dark:text-[#B6F596] dark:hover:bg-[#034D35]/30"
                          }`}
                          title={
                            tpo.status === "ACTIVE"
                              ? "Deactivate TPO"
                              : "Reactivate TPO"
                          }
                        >
                          {tpo.status === "ACTIVE" ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                        </button>
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
            className="mx-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] font-bold shadow-sm cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>officers per page</span>
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

      {/* Add / Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] border border-gray-200 dark:border-slate-700 w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn transition-colors duration-300">
            <div className="flex justify-between items-center px-6 py-5 bg-[#F9F7F1] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
                {isEditModalOpen ? "Edit TPO Details" : "Add New TPO Officer"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={isEditModalOpen ? handleEditSubmit : handleCreate}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                    placeholder="Prof. Ramesh Sharma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isEditModalOpen}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm disabled:opacity-50"
                    placeholder="ramesh.sharma@campusbridge.edu"
                  />
                </div>
                {!isEditModalOpen && (
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1">
                    An invitation link will be emailed to set up their password.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-2.5 px-6 rounded-full transition-all shadow-md text-sm disabled:opacity-50 min-w-[130px]"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>
                        {isEditModalOpen ? "Save Changes" : "Save TPO"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-slate-700 animate-scaleIn transition-colors duration-300">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-[#F9F7F1] dark:bg-slate-900 shrink-0">
              <h2 className="text-lg font-extrabold text-[#121212] dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#034D35] dark:text-[#B6F596]" />
                TPO Profile Details
              </h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingTpo(null);
                }}
                className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {loadingView ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#034D35] dark:border-[#B6F596]"></div>
                </div>
              ) : viewingTpo ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#121212] dark:text-white">
                      {viewingTpo.name}
                    </h3>
                    <div className="flex items-center text-sm font-bold text-[#034D35] dark:text-[#B6F596] mt-2">
                      <Mail className="w-4 h-4 mr-2 shrink-0 text-gray-400" />
                      {viewingTpo.email}
                    </div>
                    {viewingTpo.phone && (
                      <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5">
                        <Phone className="w-4 h-4 mr-2 shrink-0 text-gray-400" />
                        {viewingTpo.phone}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#F9F7F1] dark:bg-slate-900 rounded-[20px] p-5 space-y-3.5 border border-gray-200 dark:border-slate-700/50 shadow-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                        Status
                      </span>
                      {getStatusBadge(viewingTpo.status)}
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-slate-700/50 pt-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                        Created By
                      </span>
                      <span className="text-[#121212] dark:text-white font-bold">
                        {viewingTpo.createdBy}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-slate-700/50 pt-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                        Created Date
                      </span>
                      <span className="text-[#121212] dark:text-white font-bold">
                        {viewingTpo.createdAt
                          ? new Date(viewingTpo.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-slate-700/50 pt-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                        Last Updated
                      </span>
                      <span className="text-[#121212] dark:text-white font-bold">
                        {viewingTpo.updatedAt
                          ? new Date(viewingTpo.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500 py-8 font-bold">
                  Failed to load data
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-[#F9F7F1] dark:bg-slate-900 flex justify-end">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingTpo(null);
                }}
                className="px-5 py-2 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-[#121212] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-bold text-sm shadow-sm"
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

export default TPOManagement;
