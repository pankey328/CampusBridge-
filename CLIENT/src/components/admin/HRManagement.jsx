import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Trash2,
  Save,
  X,
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
  Link as LinkIcon,
  FileText,
  Edit2,
  RefreshCw,
  Eye,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import useDebounce from "../../hooks/useDebounce";

const HRManagement = () => {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("newest");
  const debouncedSearch = useDebounce(searchTerm, 1000);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHrId, setSelectedHrId] = useState(null);
  const [selectedHr, setSelectedHr] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    designation: "",
    phone: "",
    linkedinUrl: "",
    industry: "",
    website: "",
    gstin: "",
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchHRs = async () => {
    setLoading(true);
    try {
      let queryString = `?page=${page}&limit=${limit}&sort=${sortOption}&status=${activeTab}`;
      if (debouncedSearch) {
        queryString += `&search=${debouncedSearch}`;
      }
      const { data } = await api.get(
        `/admin/hr${queryString}`,
        getAuthHeader(),
      );
      setHrs(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch HRs", error);
      toast.error("Failed to fetch HRs");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHRs();
  }, [page, limit, activeTab, debouncedSearch, sortOption]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/hr/manual", formData, getAuthHeader());
      setShowAddModal(false);
      setFormData({
        companyName: "",
        email: "",
        designation: "",
        phone: "",
        linkedinUrl: "",
        industry: "",
        website: "",
        gstin: "",
      });
      toast.success("HR added successfully");
      fetchHRs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add HR");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm("Approve this HR registration?")) {
      try {
        await api.put(`/admin/approve-hr/${id}`, {}, getAuthHeader());
        toast.success("HR approved successfully");
        fetchHRs();
      } catch (error) {
        toast.error("Failed to approve HR");
      }
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(
        `/admin/reject-hr/${selectedHrId}`,
        { reason: rejectReason },
        getAuthHeader(),
      );
      setShowRejectModal(false);
      setRejectReason("");
      toast.success("HR rejected successfully");
      fetchHRs();
    } catch (error) {
      toast.error("Failed to reject HR");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/hr/${selectedHr.id}`, formData, getAuthHeader());
      setShowEditModal(false);
      fetchHRs();
      toast.success("HR updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update HR");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (hr) => {
    setSelectedHr(hr);
    setFormData({
      companyName: hr.companyName || "",
      email: hr.email || "",
      designation: hr.designation || "",
      phone: hr.phone || "",
      linkedinUrl: hr.linkedinUrl || "",
      industry: hr.industry || "",
      website: hr.website || "",
      gstin: hr.gstin || "",
    });
    setShowEditModal(true);
  };

  const handleView = async (id) => {
    try {
      const { data } = await api.get(`/admin/hr/${id}`, getAuthHeader());
      setViewData(data.data);
      setShowViewModal(true);
    } catch (error) {
      toast.error("Failed to fetch HR details");
    }
  };

  const handleSoftDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to deactivate this HR? They won't be able to log in.",
      )
    ) {
      try {
        await api.put(`/admin/hr/${id}/soft`, {}, getAuthHeader());
        toast.success("HR deactivated successfully");
        fetchHRs();
      } catch (error) {
        toast.error("Failed to deactivate HR");
      }
    }
  };

  const handleHardDelete = async (id) => {
    if (
      window.confirm(
        "WARNING: This will permanently delete the HR and their profile. Proceed?",
      )
    ) {
      try {
        await api.delete(`/admin/hr/${id}/hard`, getAuthHeader());
        toast.success("HR deleted permanently");
        fetchHRs();
      } catch (error) {
        toast.error("Failed to delete HR permanently");
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/admin/hr/${id}/restore`, {}, getAuthHeader());
      toast.success("HR restored successfully");
      fetchHRs();
    } catch (error) {
      toast.error("Failed to restore HR");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight mb-2">
            HR Management
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage corporate partners, approve HR requests, and oversee company
            profiles.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              companyName: "",
              email: "",
              designation: "",
              phone: "",
              linkedinUrl: "",
              industry: "",
              website: "",
              gstin: "",
            });
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-2.5 px-6 rounded-full shadow-md transition-all text-sm shrink-0 whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Manually Add HR</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Tabs */}
        <div
          className="flex overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto gap-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {["PENDING", "ACTIVE", "INACTIVE"].map((tab) => (
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
              {tab === "PENDING"
                ? "Pending Approvals"
                : tab === "ACTIVE"
                  ? "Active Companies"
                  : "Inactive / Deleted"}
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
            <option value="company_az">Company (A-Z)</option>
            <option value="company_za">Company (Z-A)</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search company or email..."
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
              <th className="px-6 py-5">Company</th>
              <th className="px-6 py-5">Representative</th>
              <th className="px-6 py-5">Email / Phone</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {!loading && hrs.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium"
                >
                  No HR partners found matching your criteria.
                </td>
              </tr>
            ) : (
              hrs.map((hr) => (
                <tr
                  key={hr.id}
                  className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {hr.logoUrl ? (
                        <div className="w-12 h-12 rounded-[14px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
                          <img
                            src={hr.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-[14px] bg-[#F9F7F1] dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                          <Building2 size={20} />
                        </div>
                      )}
                      <span className="font-extrabold text-[#121212] dark:text-white text-base">
                        {hr.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#121212] dark:text-gray-200">
                      {hr.designation || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#034D35] dark:text-[#B6F596] truncate max-w-[200px]">
                      {hr.email}
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                      {hr.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {hr.isApproved ? (
                      hr.status === "PENDING" ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          Pending Setup
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/20 dark:border-[#B6F596]/20">
                          Active
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                        Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {activeTab === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleApprove(hr.id)}
                            title="Approve"
                            className="p-2 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[#034D35] hover:bg-[#B6F596]/20 dark:text-[#B6F596] dark:hover:bg-[#034D35]/30 rounded-full transition-colors shadow-sm"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHrId(hr.id);
                              setShowRejectModal(true);
                            }}
                            title="Reject"
                            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors shadow-sm"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      ) : activeTab === "ACTIVE" ? (
                        <>
                          <button
                            onClick={() => handleView(hr.id)}
                            title="View Details"
                            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-[#121212] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors shadow-sm"
                          >
                            <Eye size={18} />
                          </button>

                          {hr.status === "PENDING" && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.post(
                                    `/admin/hr/${hr.id}/resend-activation`,
                                    {},
                                    getAuthHeader(),
                                  );
                                  toast.success(
                                    "New setup link generated and sent via email!",
                                  );
                                } catch (err) {
                                  toast.error("Failed to resend setup link.");
                                }
                              }}
                              title="Resend Setup Link"
                              className="p-2 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors shadow-sm"
                            >
                              <Mail size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(hr)}
                            title="Edit Details"
                            className="p-2 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors shadow-sm"
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            onClick={() => handleSoftDelete(hr.id)}
                            title="Deactivate (Soft Delete)"
                            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(hr.id)}
                            title="Restore HR"
                            className="p-2 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors shadow-sm"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handleHardDelete(hr.id)}
                            title="PERMANENTLY DELETE"
                            className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
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
            className="mx-3 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] font-bold shadow-sm cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>HRs per page</span>
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

      {/* COMPACT Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] border border-gray-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center px-6 py-5 bg-[#F9F7F1] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
                {showAddModal
                  ? "Manually Add Corporate Partner"
                  : "Edit Corporate Partner"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit}
              className="p-5 md:p-6 space-y-5 custom-scrollbar overflow-y-auto max-h-[75vh]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-[#121212] dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">
                    Recruiter Details
                  </h3>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                        placeholder="hr@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="designation"
                        required
                        value={formData.designation}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                        placeholder="e.g. Talent Acquisition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-[#121212] dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">
                    Company Details
                  </h3>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Industry
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                        placeholder="e.g. Tech"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Company Website
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                        placeholder="https://abc.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      GSTIN
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-2.5 px-6 rounded-full transition-all shadow-md text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>
                        {showAddModal ? "Save & Send Link" : "Save Changes"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPACT Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] border border-gray-200 dark:border-slate-700 w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn transition-colors duration-300">
            <div className="p-6">
              <h3 className="text-xl font-extrabold text-[#121212] dark:text-white mb-1.5">
                Reject Registration
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-5">
                Provide a reason for rejecting this HR. This will be sent to
                them via email.
              </p>

              <form onSubmit={handleReject}>
                <textarea
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 h-28 resize-none text-sm font-medium shadow-sm transition-all"
                  placeholder="Enter rejection reason..."
                />

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-5 py-2 rounded-full bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-all shadow-md text-sm disabled:opacity-50"
                  >
                    {saving && (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>Reject</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[28px] shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 dark:border-slate-700 animate-slide-up transition-colors duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-[#F9F7F1] dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#034D35] dark:text-[#B6F596] border border-gray-200 dark:border-slate-700 shadow-sm shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#121212] dark:text-white flex items-center gap-2">
                    {viewData.companyName}
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        viewData.status === "ACTIVE"
                          ? "bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/20 dark:border-[#B6F596]/20"
                          : viewData.status === "PENDING"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                      }`}
                    >
                      {viewData.status}
                    </span>
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Contact & Professional Details */}
                <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-5 rounded-[20px] shadow-sm">
                  <h4 className="text-[#121212] dark:text-white font-extrabold text-sm mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">
                    Contact & Professional Details
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        Email
                      </span>
                      <span className="text-[#034D35] dark:text-[#B6F596] font-bold text-sm truncate block">
                        {viewData.email}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        Phone
                      </span>
                      <span className="text-[#121212] dark:text-white font-bold text-sm">
                        {viewData.phone || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        Designation
                      </span>
                      <span className="text-[#121212] dark:text-white font-bold text-sm">
                        {viewData.designation || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        Industry
                      </span>
                      <span className="text-[#121212] dark:text-white font-bold text-sm">
                        {viewData.industry || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        Website
                      </span>
                      <span className="text-[#121212] dark:text-white font-bold text-sm block truncate">
                        {viewData.website ? (
                          <a
                            href={viewData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {viewData.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        GSTIN
                      </span>
                      <span className="text-[#121212] dark:text-white font-bold text-sm">
                        {viewData.gstin || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Details */}
                <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-5 rounded-[20px] shadow-sm">
                  <h4 className="text-[#121212] dark:text-white font-extrabold text-sm mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">
                    System Record
                  </h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        Created At
                      </span>
                      <span className="text-[#121212] dark:text-white text-sm font-bold">
                        {new Date(viewData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">
                        Last Updated
                      </span>
                      <span className="text-[#121212] dark:text-white text-sm font-bold">
                        {new Date(viewData.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {viewData.createdBy && (
                      <div className="col-span-2 pt-1 border-t border-gray-100 dark:border-slate-700/50">
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-bold">
                          Added By
                        </span>
                        <span className="text-[#121212] dark:text-gray-300 text-[11px] font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 inline-block uppercase tracking-wide">
                          {viewData.createdBy.role}:{" "}
                          <span className="lowercase font-medium">
                            {viewData.createdBy.email}
                          </span>
                        </span>
                      </div>
                    )}

                    {viewData.updatedBy && (
                      <div className="col-span-2 pt-1 border-t border-gray-100 dark:border-slate-700/50">
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-bold">
                          Last Updated By
                        </span>
                        <span className="text-[#121212] dark:text-gray-300 text-[11px] font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 inline-block uppercase tracking-wide">
                          {viewData.updatedBy.role}:{" "}
                          <span className="lowercase font-medium">
                            {viewData.updatedBy.email}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRManagement;
