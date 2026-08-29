import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  RefreshCw,
  X,
  Save,
  Eye,
  ExternalLink,
} from "lucide-react";
import api from "../../services/api";
import useDebounce from "../../hooks/useDebounce";
import toast from "react-hot-toast";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ACTIVE"); // ACTIVE, PENDING, INACTIVE
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 1000);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOption, setSortOption] = useState("newest");
  const [totalPages, setTotalPages] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [mockAttempts, setMockAttempts] = useState([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rollNumber: "",
    branch: "",
    passoutYear: new Date().getFullYear(),
    cgpa: 0,
    activeBacklogs: 0,
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let queryString = `?page=${page}&limit=${limit}&status=${activeTab}&sort=${sortOption}`;
      if (debouncedSearch) {
        queryString += `&search=${debouncedSearch}`;
      }
      const { data } = await api.get(
        `/admin/students${queryString}`,
        getAuthHeader(),
      );
      setStudents(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [activeTab, debouncedSearch, page, limit, sortOption]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/students/manual", formData, getAuthHeader());
      setShowAddModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        rollNumber: "",
        branch: "",
        passoutYear: new Date().getFullYear(),
        cgpa: 0,
        activeBacklogs: 0,
      });
      toast.success("Student added successfully");
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(
        `/admin/students/${selectedStudent.id}`,
        formData,
        getAuthHeader(),
      );
      setShowEditModal(false);
      toast.success("Student updated successfully");
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      rollNumber: student.rollNumber,
      branch: student.branch,
      passoutYear: student.passoutYear,
      cgpa: student.cgpa || 0,
      activeBacklogs: student.activeBacklogs || 0,
    });
    setShowEditModal(true);
  };

  const handleView = async (id) => {
    try {
      const { data } = await api.get(`/admin/students/${id}`, getAuthHeader());
      setViewData(data.data);

      // Fetch mock attempts for student
      try {
        const attemptsRes = await api.get(
          `/mock/attempts/${id}`,
          getAuthHeader(),
        );
        setMockAttempts(attemptsRes.data.attempts || []);
      } catch (attemptsError) {
        console.error(
          "Failed to fetch mock attempts for student",
          attemptsError,
        );
        setMockAttempts([]);
      }

      setShowViewModal(true);
    } catch (error) {
      toast.error("Failed to fetch student details");
    }
  };

  const handleSoftDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to deactivate this student? They won't be able to log in.",
      )
    ) {
      try {
        await api.put(`/admin/students/${id}/soft`, {}, getAuthHeader());
        toast.success("Student deactivated");
        fetchStudents();
      } catch (error) {
        toast.error("Failed to deactivate student");
      }
    }
  };

  const handleHardDelete = async (id) => {
    if (
      window.confirm(
        "WARNING: This will permanently delete the student and all their data. Proceed?",
      )
    ) {
      try {
        await api.delete(`/admin/students/${id}/hard`, getAuthHeader());
        toast.success("Student deleted permanently");
        fetchStudents();
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/admin/students/${id}/restore`, {}, getAuthHeader());
      toast.success("Student restored successfully");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to restore student");
    }
  };

  const handleToggleLock = async (id) => {
    try {
      await api.put(`/admin/students/${id}/lock`, {}, getAuthHeader());
      toast.success("Student lock status toggled");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to toggle lock status");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight mb-2">
            Student Management
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage student profiles, academic records, and application access.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Tabs */}
        <div
          className="flex overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto gap-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {["ACTIVE", "PENDING", "INACTIVE"].map((tab) => (
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
              {tab}
            </button>
          ))}
        </div>

        {/* Search, Sort & Add */}
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
            <option value="roll_asc">Enrollment No. (Asc)</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name, roll..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white pl-10 pr-4 py-2.5 rounded-full text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all"
            />
          </div>

          <button
            onClick={() => {
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                rollNumber: "",
                branch: "",
                passoutYear: new Date().getFullYear(),
                cgpa: 0,
                activeBacklogs: 0,
              });
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-2.5 px-6 rounded-full shadow-md transition-all text-sm shrink-0 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

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
              <th className="px-6 py-5">Name</th>
              <th className="px-6 py-5">Enrollment No.</th>
              <th className="px-6 py-5">Email</th>
              <th className="px-6 py-5">Branch/Year</th>
              <th className="px-6 py-5">Apply Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {!loading && students.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium"
                >
                  No students found matching your criteria.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-extrabold text-[#121212] dark:text-white text-base">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {student.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#121212] dark:text-gray-200">
                      {student.branch || "-"}
                    </div>
                    <div className="text-xs mt-1 font-bold text-gray-500 dark:text-gray-400">
                      Class of {student.passoutYear}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.isLocked ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                        <Shield size={12} /> Locked
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596] border border-[#034D35]/20 dark:border-[#B6F596]/20">
                        Allowed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Toggle Lock Button */}
                      <button
                        onClick={() => handleToggleLock(student.id)}
                        title={
                          student.isLocked
                            ? "Unlock Applications"
                            : "Lock Applications"
                        }
                        className={`p-2 rounded-full transition-colors shadow-sm border ${
                          student.isLocked
                            ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40"
                            : "bg-[#F9F7F1] dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-[#034D35] dark:text-[#B6F596] hover:bg-[#B6F596]/20 dark:hover:bg-[#034D35]/30"
                        }`}
                      >
                        <Shield size={16} />
                      </button>

                      {/* View Button */}
                      <button
                        onClick={() => handleView(student.id)}
                        title="View Details"
                        className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-[#121212] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors shadow-sm"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(student)}
                        title="Edit Details"
                        className="p-2 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* Soft/Hard Delete and Restore */}
                      {activeTab !== "INACTIVE" ? (
                        <button
                          onClick={() => handleSoftDelete(student.id)}
                          title="Deactivate (Soft Delete)"
                          className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(student.id)}
                            title="Restore Student"
                            className="p-2 bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors shadow-sm"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            onClick={() => handleHardDelete(student.id)}
                            title="PERMANENTLY DELETE"
                            className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors shadow-sm"
                          >
                            <Trash2 size={16} />
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
          <span>students per page</span>
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
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center p-6 md:p-8 bg-[#F9F7F1] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-extrabold text-[#121212] dark:text-white">
                {showAddModal ? "Manually Add Student" : "Edit Student Details"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit}
              className="p-6 md:p-8 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    Roll No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    Passout Year
                  </label>
                  <input
                    type="number"
                    name="passoutYear"
                    value={formData.passoutYear}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 mb-1.5 uppercase tracking-wider">
                    Active Backlogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="activeBacklogs"
                    value={formData.activeBacklogs}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-6 py-3 rounded-full bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-3 px-8 rounded-full transition-all shadow-md text-sm disabled:opacity-50"
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
                        {showAddModal ? "Save Student" : "Update Student"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up transition-colors duration-300">
            {/* Header */}
            <div className="px-6 md:px-8 py-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-start bg-[#F9F7F1] dark:bg-slate-900 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-16 h-16 rounded-[18px] bg-white dark:bg-slate-800 flex items-center justify-center text-[#034D35] dark:text-[#B6F596] text-2xl font-extrabold border border-gray-200 dark:border-slate-700 shadow-sm shrink-0">
                  {viewData.firstName[0]}
                  {viewData.lastName[0]}
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#121212] dark:text-white flex flex-wrap items-center gap-3">
                    {viewData.firstName} {viewData.lastName}
                    <span
                      className={`text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider font-bold ${
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
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span>{viewData.email}</span>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">
                      •
                    </span>
                    <span className="font-bold uppercase tracking-wider">
                      {viewData.rollNumber}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-[#121212] dark:hover:text-white bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left Column */}
                <div className="space-y-6 md:space-y-8">
                  {/* Academic Details Card */}
                  <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-6 md:p-8 rounded-[24px] shadow-sm">
                    <h4 className="text-[#121212] dark:text-white font-extrabold text-lg mb-5 border-b border-gray-200 dark:border-slate-700 pb-3">
                      Academic Profile
                    </h4>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-bold">
                          Branch
                        </span>
                        <span className="text-[#121212] dark:text-white font-bold">
                          {viewData.branch || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-bold">
                          Passout Year
                        </span>
                        <span className="text-[#121212] dark:text-white font-bold">
                          {viewData.passoutYear}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-bold">
                          CGPA
                        </span>
                        <span className="text-[#034D35] dark:text-[#B6F596] font-extrabold text-xl">
                          {viewData.cgpa || "0"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-bold">
                          Active Backlogs
                        </span>
                        <span
                          className={`font-extrabold text-xl ${viewData.activeBacklogs > 0 ? "text-red-500 dark:text-red-400" : "text-[#121212] dark:text-white"}`}
                        >
                          {viewData.activeBacklogs || "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio & Contact Card */}
                  <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-6 md:p-8 rounded-[24px] shadow-sm">
                    <h4 className="text-[#121212] dark:text-white font-extrabold text-lg mb-5 border-b border-gray-200 dark:border-slate-700 pb-3">
                      Contact & Portfolio
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-[16px] border border-gray-100 dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                          Phone
                        </span>
                        <span className="text-[#121212] dark:text-white text-sm font-bold">
                          {viewData.phone || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-[16px] border border-gray-100 dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                          LinkedIn
                        </span>
                        {viewData.linkedinUrl ? (
                          <a
                            href={viewData.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1.5 font-bold transition-colors"
                          >
                            View Profile <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">
                            -
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-[16px] border border-gray-100 dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                          GitHub
                        </span>
                        {viewData.githubUrl ? (
                          <a
                            href={viewData.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#121212] dark:text-white hover:underline text-sm flex items-center gap-1.5 font-bold transition-colors"
                          >
                            View Profile <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">
                            -
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center bg-[#B6F596]/10 dark:bg-[#034D35]/10 p-4 rounded-[16px] border border-[#034D35]/20 dark:border-[#B6F596]/20">
                        <span className="text-sm font-bold text-[#034D35] dark:text-[#B6F596]">
                          Resume
                        </span>
                        {viewData.resumeUrl ? (
                          <a
                            href={viewData.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#034D35] dark:text-[#B6F596] hover:underline text-sm flex items-center gap-1.5 font-extrabold transition-colors"
                          >
                            Download PDF <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">
                            -
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 md:space-y-8">
                  {/* Skills Card */}
                  <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-6 md:p-8 rounded-[24px] shadow-sm">
                    <h4 className="text-[#121212] dark:text-white font-extrabold text-lg mb-5 border-b border-gray-200 dark:border-slate-700 pb-3">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {viewData.skills && viewData.skills.length > 0 ? (
                        viewData.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-white dark:bg-slate-800 text-[#121212] dark:text-gray-300 border border-gray-200 dark:border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <div className="w-full text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                          <span className="text-gray-500 font-medium text-sm">
                            No skills listed yet
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Details Card */}
                  <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-6 md:p-8 rounded-[24px] shadow-sm">
                    <h4 className="text-[#121212] dark:text-white font-extrabold text-lg mb-5 border-b border-gray-200 dark:border-slate-700 pb-3">
                      System Details
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-5 rounded-[20px] border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2.5 rounded-[14px] ${viewData.isLocked ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-[#B6F596]/40 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596]"}`}
                          >
                            <Shield size={20} />
                          </div>
                          <div>
                            <span className="block text-sm text-[#121212] dark:text-white font-extrabold">
                              Application Lock
                            </span>
                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                              Controls if student can apply
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${viewData.isLocked ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50" : "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50"}`}
                        >
                          {viewData.isLocked ? "LOCKED" : "ALLOWED"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-5 rounded-[20px] border border-gray-200 dark:border-slate-700 shadow-sm">
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
                          <div className="col-span-2 pt-3 mt-1 border-t border-gray-100 dark:border-slate-700/50">
                            <span className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider font-bold">
                              Added By
                            </span>
                            <span className="text-[#121212] dark:text-gray-300 text-xs font-bold bg-[#F9F7F1] dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 inline-block uppercase tracking-wide">
                              {viewData.createdBy.role}:{" "}
                              <span className="lowercase font-medium">
                                {viewData.createdBy.email}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Practice Mock Attempts Card */}
                {(() => {
                  const ratedAttempts = mockAttempts.filter(
                    (a) =>
                      typeof a.overallRating === "number" &&
                      a.overallRating !== null,
                  );
                  const averageScore =
                    ratedAttempts.length > 0
                      ? (
                          ratedAttempts.reduce(
                            (acc, curr) => acc + curr.overallRating,
                            0,
                          ) / ratedAttempts.length
                        ).toFixed(1)
                      : "—";

                  return (
                    <div className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 p-6 md:p-8 rounded-[24px] shadow-sm md:col-span-2 space-y-6 transition-colors duration-300">
                      <h4 className="text-[#121212] dark:text-white font-extrabold flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4 flex-wrap gap-4 text-lg">
                        <span>AI Mock Practice History</span>
                        <span className="text-[11px] text-[#034D35] dark:text-[#B6F596] font-bold bg-[#B6F596]/30 dark:bg-[#034D35]/50 px-4 py-1.5 rounded-full uppercase tracking-wider">
                          Avg Score: {averageScore}/10
                        </span>
                      </h4>
                      {mockAttempts && mockAttempts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mockAttempts.map((attempt, index) => (
                            <div
                              key={index}
                              className="bg-white dark:bg-slate-800 p-5 rounded-[20px] border border-gray-200 dark:border-slate-700 space-y-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-sm font-extrabold text-[#121212] dark:text-white">
                                    Attempt #{mockAttempts.length - index}
                                  </span>
                                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mt-0.5">
                                    {new Date(
                                      attempt.timestamp,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <span className="bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                  {attempt.overallRating !== null &&
                                  attempt.overallRating !== undefined
                                    ? `${attempt.overallRating}/10`
                                    : "—"}
                                </span>
                              </div>
                              {attempt.jobDriveId && (
                                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-slate-700/50">
                                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2">
                                    Drive:
                                  </span>
                                  {attempt.jobDriveId.title}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-[20px]">
                          <span className="text-gray-500 font-medium text-sm">
                            No practice attempts recorded yet
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
