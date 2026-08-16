import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Lock, Unlock, Mail, Phone, Calendar, Eye, User as UserIcon } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TPOManagement = () => {
  const [tpos, setTpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
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
    try {
      const response = await api.get('/superadmin/tpos', getAuthHeader());
      setTpos(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch TPOs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTPOs();
  }, []);

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

  const filteredTpos = tpos.filter(tpo => {
    if (activeTab === 'ALL') return true;
    return tpo.status === activeTab;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">TPO Management</h1>
          <p className="text-[var(--color-text-secondary)]">Onboard and manage Training and Placement Officers.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', phone: '' });
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-2 px-6 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Add New TPO</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total TPOs', value: tpos.length, icon: <Shield className="text-blue-500" size={24} /> },
          { label: 'Active', value: tpos.filter(t => t.status === 'ACTIVE').length, icon: <Unlock className="text-[var(--color-brand-primary)]" size={24} /> },
          { label: 'Pending setup', value: tpos.filter(t => t.status === 'PENDING').length, icon: <Lock className="text-yellow-500" size={24} /> }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[var(--color-text-secondary)] font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-[var(--color-text-primary)]">{stat.value}</h3>
            </div>
            <div className="p-4 bg-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] shadow-sm">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[400px]">

        {/* Table Controls */}
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-secondary)]">
          <div className="flex space-x-2">
            {['ALL', 'ACTIVE', 'PENDING', 'INACTIVE'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                    ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-primary)]"></div>
            </div>
          ) : filteredTpos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] p-12">
              <Shield className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">No TPOs found for this status.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                  <th className="p-4 text-[var(--color-text-secondary)] font-semibold text-sm">TPO Name</th>
                  <th className="p-4 text-[var(--color-text-secondary)] font-semibold text-sm">Contact</th>
                  <th className="p-4 text-[var(--color-text-secondary)] font-semibold text-sm">Status</th>
                  <th className="p-4 text-[var(--color-text-secondary)] font-semibold text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTpos.map((tpo) => (
                  <tr key={tpo.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-primary)]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center text-[var(--color-brand-primary)] font-bold">
                          {tpo.name ? tpo.name.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">{tpo.name}</p>
                          <p className="text-xs text-[var(--color-text-secondary)]">Added by {tpo.createdBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        <span className="flex items-center text-sm text-[var(--color-text-secondary)]">
                          <Mail size={14} className="mr-2 text-[var(--color-text-secondary)]" /> {tpo.email}
                        </span>
                        {tpo.phone && (
                          <span className="flex items-center text-sm text-[var(--color-text-secondary)]">
                            <Phone size={14} className="mr-2 text-[var(--color-text-secondary)]" /> {tpo.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tpo.status === 'ACTIVE' ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]/20' :
                          tpo.status === 'INACTIVE' ? 'bg-red-900/30 text-red-500 border-red-700/50' :
                            'bg-yellow-900/30 text-yellow-500 border-yellow-700/50'
                        }`}>
                        {tpo.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewTpo(tpo)}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openEditModal(tpo)}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10 rounded transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 size={18} />
                        </button>
                        {tpo.status !== 'PENDING' && (
                          <button
                            onClick={() => handleToggleStatus(tpo.id, tpo.status)}
                            className={`p-2 rounded transition-colors ${tpo.status === 'ACTIVE'
                                ? 'text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10'
                              }`}
                            title={tpo.status === 'ACTIVE' ? "Deactivate" : "Activate"}
                          >
                            {tpo.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl w-full max-w-md overflow-hidden border border-[var(--color-border)] shadow-2xl">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-primary)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {isEditModalOpen ? 'Edit TPO Details' : 'Add New TPO'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                &times;
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)]"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isEditModalOpen}
                  className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] disabled:opacity-50"
                  placeholder="john@campusbridge.edu"
                />
                {!isEditModalOpen && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">An invitation email will be sent to this address to set up their password.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)]"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[var(--color-border)] mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-6 py-2 rounded-lg font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-[#001E2B] font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center shadow-md"
                >
                  {submitting ? 'Saving...' : 'Save TPO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl w-full max-w-md overflow-hidden border border-[var(--color-border)] shadow-2xl">
            <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-primary)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-[var(--color-brand-primary)]" />
                TPO Profile Details
              </h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingTpo(null);
                }}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {loadingView ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-brand-primary)]"></div>
                </div>
              ) : viewingTpo ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{viewingTpo.name}</h3>
                    <div className="flex items-center text-sm text-[var(--color-text-secondary)] mt-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {viewingTpo.email}
                    </div>
                    {viewingTpo.phone && (
                      <div className="flex items-center text-sm text-[var(--color-text-secondary)] mt-1">
                        <Phone className="w-4 h-4 mr-2" />
                        {viewingTpo.phone}
                      </div>
                    )}
                  </div>

                  <div className="bg-[var(--color-bg-primary)] rounded-lg p-4 space-y-3 border border-[var(--color-border)]">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--color-text-secondary)]">Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${viewingTpo.status === 'ACTIVE' ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border-[var(--color-brand-primary)]/20' :
                          viewingTpo.status === 'INACTIVE' ? 'bg-red-900/30 text-red-500 border-red-700/50' :
                            'bg-yellow-900/30 text-yellow-500 border-yellow-700/50'
                        }`}>
                        {viewingTpo.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--color-text-secondary)]">Created By</span>
                      <span className="text-[var(--color-text-primary)] font-medium">{viewingTpo.createdBy}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--color-text-secondary)]">Created At</span>
                      <span className="text-[var(--color-text-primary)] font-medium">
                        {viewingTpo.createdAt ? new Date(viewingTpo.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--color-text-secondary)]">Last Updated</span>
                      <span className="text-[var(--color-text-primary)] font-medium">
                        {viewingTpo.updatedAt ? new Date(viewingTpo.updatedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500 py-8">Failed to load data</div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] flex justify-end">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingTpo(null);
                }}
                className="px-6 py-2 rounded-lg font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
