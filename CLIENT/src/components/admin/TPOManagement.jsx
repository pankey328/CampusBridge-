import { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Lock, Unlock, Mail, Phone, Calendar, Eye, User as UserIcon, Search, Save, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';

const TPOManagement = () => {
  const [tpos, setTpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOption, setSortOption] = useState('newest');
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentTpo, setCurrentTpo] = useState(null);
  const [viewingTpo, setViewingTpo] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchTPOs = async () => {
    setLoading(true);
    try {
      let queryString = `?page=${page}&limit=${limit}&status=${activeTab}&sort=${sortOption}`;
      if (debouncedSearch) {
        queryString += `&search=${debouncedSearch}`;
      }
      const response = await api.get(`/superadmin/tpos${queryString}`, getAuthHeader());
      setTpos(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      }
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch TPOs');
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
      await api.post('/superadmin/tpos', formData, getAuthHeader());
      toast.success("TPO created. Setup email sent.");
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '' });
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
      await api.put(`/superadmin/tpos/${currentTpo.id}`, { name: formData.name, phone: formData.phone }, getAuthHeader());
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
    setFormData({ name: tpo.name, email: tpo.email, phone: tpo.phone || '' });
    setIsEditModalOpen(true);
  };

  const handleViewTpo = async (tpo) => {
    setLoadingView(true);
    setIsViewModalOpen(true);
    try {
      const response = await api.get(`/superadmin/tpos/${tpo.id}`, getAuthHeader());
      setViewingTpo(response.data.data);
    } catch (error) {
      toast.error('Failed to load TPO details');
      setIsViewModalOpen(false);
    } finally {
      setLoadingView(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (currentStatus === 'PENDING') {
      toast.error("Cannot toggle status of a PENDING TPO.");
      return;
    }
    const action = currentStatus === 'ACTIVE' ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} this TPO?`)) return;

    try {
      await api.put(`/superadmin/tpos/${id}/toggle-status`, {}, getAuthHeader());
      toast.success(`TPO successfully ${action}d`);
      fetchTPOs();
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">TPO Management</h1>
          <p className="text-gray-400">Onboard and manage Training and Placement Officers.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '' });
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-2.5 px-5 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-lg shadow-[#00ED64]/10"
        >
          <Plus size={18} />
          <span>Add New TPO</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total TPOs', value: stats.total, icon: <Shield className="text-blue-400" size={24} />, border: 'border-blue-500/20', bg: 'bg-blue-900/10' },
          { label: 'Active Officers', value: stats.active, icon: <Unlock className="text-[#00ED64]" size={24} />, border: 'border-[#00ED64]/20', bg: 'bg-[#00ED64]/10' },
          { label: 'Pending Setup', value: stats.pending, icon: <Lock className="text-yellow-400" size={24} />, border: 'border-yellow-500/20', bg: 'bg-yellow-900/10' }
        ].map((stat, i) => (
          <div key={i} className={`bg-[#0A192F] p-5 rounded-xl border ${stat.border} flex items-center justify-between`}>
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
            <div className={`p-3.5 rounded-xl ${stat.bg} border border-gray-800`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Tabs */}
        <div className="flex bg-[#0A192F] p-1 rounded-lg border border-gray-800 flex-wrap sm:flex-nowrap">
          {['ALL', 'ACTIVE', 'PENDING', 'INACTIVE'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-5 py-2 rounded-md transition-all text-sm font-medium ${
                activeTab === tab
                  ? 'bg-[#00ED64] text-[#0A192F] font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row w-full xl:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            className="bg-[#0A192F] border border-gray-700 text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:border-[#00ED64]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_az">Name (A-Z)</option>
            <option value="name_za">Name (Z-A)</option>
          </select>

          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full bg-[#0A192F] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]"
            />
          </div>
        </div>
      </div>

      <div className="relative rounded-lg border border-gray-800 overflow-x-auto w-full bg-[#0A192F]/50">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-[#0A192F] text-gray-400">
            <tr>
              <th className="px-6 py-4">TPO Officer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00ED64]"></div>
                </td>
              </tr>
            ) : tpos.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  <Shield className="w-12 h-12 mb-3 opacity-30 mx-auto" />
                  <p className="text-base font-medium text-gray-400">No TPO officers found.</p>
                </td>
              </tr>
            ) : (
              tpos.map((tpo) => (
                <tr key={tpo.id} className="border-b border-gray-800 hover:bg-[#0A192F]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#00ED64]/10 border border-[#00ED64]/20 flex items-center justify-center text-[#00ED64] font-bold">
                        {tpo.name ? tpo.name.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tpo.name}</p>
                        <p className="text-xs text-gray-400">Added by {tpo.createdBy}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="flex items-center text-sm text-gray-300">
                        <Mail size={14} className="mr-2 text-[#00ED64]" /> {tpo.email}
                      </span>
                      {tpo.phone && (
                        <span className="flex items-center text-xs text-gray-400">
                          <Phone size={14} className="mr-2 text-gray-500" /> {tpo.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      tpo.status === 'ACTIVE'
                        ? 'bg-[#00ED64]/10 text-[#00ED64] border-[#00ED64]/20'
                        : tpo.status === 'INACTIVE'
                          ? 'bg-red-900/30 text-red-400 border-red-800/50'
                          : 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50'
                    }`}>
                      {tpo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleViewTpo(tpo)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors inline-block"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => openEditModal(tpo)}
                      className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors inline-block"
                      title="Edit Details"
                    >
                      <Edit2 size={18} />
                    </button>
                    {tpo.status !== 'PENDING' && (
                      <button
                        onClick={() => handleToggleStatus(tpo.id, tpo.status)}
                        className={`p-1.5 rounded transition-colors inline-block ${
                          tpo.status === 'ACTIVE'
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                            : 'text-[#00ED64] hover:text-[#00c954] hover:bg-[#00ED64]/10'
                        }`}
                        title={tpo.status === 'ACTIVE' ? "Deactivate TPO" : "Reactivate TPO"}
                      >
                        {tpo.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0A192F] p-4 rounded-lg border border-gray-800 w-full">
        <div className="flex items-center text-sm text-gray-400">
          <span>Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="mx-2 bg-[#112240] border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-[#00ED64]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>officers per page</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                page === 1
                  ? "border-gray-700 text-gray-600 cursor-not-allowed"
                  : "border-gray-600 text-gray-300 hover:text-white hover:border-[#00ED64]"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                page === totalPages || totalPages === 0
                  ? "border-gray-700 text-gray-600 cursor-not-allowed"
                  : "border-gray-600 text-gray-300 hover:text-white hover:border-[#00ED64]"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#112240] rounded-2xl w-full max-w-md overflow-hidden border border-gray-800 shadow-2xl animate-scaleIn">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0A192F]">
              <h2 className="text-xl font-bold text-white">
                {isEditModalOpen ? 'Edit TPO Details' : 'Add New TPO Officer'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00ED64]"
                  placeholder="Prof. Ramesh Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isEditModalOpen}
                  className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00ED64] disabled:opacity-50"
                  placeholder="ramesh.sharma@campusbridge.edu"
                />
                {!isEditModalOpen && (
                  <p className="text-[11px] text-gray-400 mt-1">An invitation link will be emailed to set up their password.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00ED64]"
                  placeholder="9876543210"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-[#00ED64]/10 min-w-[150px]"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save TPO Officer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#112240] rounded-2xl w-full max-w-md overflow-hidden border border-gray-800 shadow-2xl animate-scaleIn">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0A192F]">
              <h2 className="text-lg font-bold text-white flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-[#00ED64]" />
                TPO Profile Details
              </h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingTpo(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {loadingView ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ED64]"></div>
                </div>
              ) : viewingTpo ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{viewingTpo.name}</h3>
                    <div className="flex items-center text-sm text-gray-300 mt-2">
                      <Mail className="w-4 h-4 mr-2 text-[#00ED64]" />
                      {viewingTpo.email}
                    </div>
                    {viewingTpo.phone && (
                      <div className="flex items-center text-sm text-gray-400 mt-1.5">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        {viewingTpo.phone}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0A192F] rounded-xl p-4 space-y-3 border border-gray-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        viewingTpo.status === 'ACTIVE'
                          ? 'bg-[#00ED64]/10 text-[#00ED64] border-[#00ED64]/20'
                          : viewingTpo.status === 'INACTIVE'
                            ? 'bg-red-900/30 text-red-400 border-red-800/50'
                            : 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50'
                      }`}>
                        {viewingTpo.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Created By</span>
                      <span className="text-white font-medium">{viewingTpo.createdBy}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Created Date</span>
                      <span className="text-gray-300 font-medium">
                        {viewingTpo.createdAt ? new Date(viewingTpo.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-gray-300 font-medium">
                        {viewingTpo.updatedAt ? new Date(viewingTpo.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-400 py-8">Failed to load data</div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-[#0A192F] flex justify-end">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingTpo(null);
                }}
                className="px-5 py-2 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
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
