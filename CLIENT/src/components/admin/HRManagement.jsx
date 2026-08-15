import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle, XCircle, Trash2, Save, X, Building2, User, Mail, Phone, Briefcase, Link as LinkIcon, FileText, Edit2, RefreshCw, Eye } from 'lucide-react';
import api from '../../services/api';

const HRManagement = () => {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING or ACTIVE
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHrId, setSelectedHrId] = useState(null);
  const [selectedHr, setSelectedHr] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    designation: '',
    phone: '',
    linkedinUrl: '',
    industry: '',
    website: '',
    gstin: '',
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchHRs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/hr?status=${activeTab}`, getAuthHeader());
      // Searching
      const hrList = data.data || [];
      if (searchTerm) {
        setHrs(hrList.filter(hr => hr.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || hr.email.toLowerCase().includes(searchTerm.toLowerCase())));
      } else {
        setHrs(hrList);
      }
    } catch (error) {
      console.error("Failed to fetch HRs", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchHRs();
    }, 300);
    return () => clearTimeout(timeout);
  }, [activeTab, searchTerm]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/hr/manual', formData, getAuthHeader());
      setShowAddModal(false);
      setFormData({ companyName: '', email: '', designation: '', phone: '', linkedinUrl: '', industry: '', website: '', gstin: '' });

      fetchHRs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add HR");
    }
  };

  const handleApprove = async (id) => {
    if(window.confirm("Approve this HR registration?")) {
      try {
        await api.put(`/admin/approve-hr/${id}`, {}, getAuthHeader());
        fetchHRs();
      } catch (error) {
        alert("Failed to approve HR");
      }
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/reject-hr/${selectedHrId}`, { reason: rejectReason }, getAuthHeader());
      setShowRejectModal(false);
      setRejectReason("");

      fetchHRs();
    } catch (error) {
      alert("Failed to reject HR");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/hr/${selectedHr.id}`, formData, getAuthHeader());
      setShowEditModal(false);
      fetchHRs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update HR");
    }
  };

  const openEditModal = (hr) => {
    setSelectedHr(hr);
    setFormData({
      companyName: hr.companyName || '',
      email: hr.email || '',
      designation: hr.designation || '',
      phone: hr.phone || '',
      linkedinUrl: hr.linkedinUrl || '',
      industry: hr.industry || '',
      website: hr.website || '',
      gstin: hr.gstin || ''
    });
    setShowEditModal(true);
  };

  const handleView = async (id) => {
    try {
      const { data } = await api.get(`/admin/hr/${id}`, getAuthHeader());
      setViewData(data.data);
      setShowViewModal(true);
    } catch (error) {
      alert("Failed to fetch HR details");
    }
  };

  const handleSoftDelete = async (id) => {
    if(window.confirm("Are you sure you want to deactivate this HR? They won't be able to log in.")) {
      try {
        await api.put(`/admin/hr/${id}/soft`, {}, getAuthHeader());
        fetchHRs();
      } catch (error) {
        alert("Failed to deactivate HR");
      }
    }
  };

  const handleHardDelete = async (id) => {
    if(window.confirm("WARNING: This will permanently delete the HR and their profile. Proceed?")) {
      try {
        await api.delete(`/admin/hr/${id}/hard`, getAuthHeader());
        fetchHRs();
      } catch (error) {
        alert("Failed to delete HR permanently");
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/admin/hr/${id}/restore`, {}, getAuthHeader());
      fetchHRs();
    } catch (error) {
      alert("Failed to restore HR");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Tabs */}
        <div className="flex bg-[#0A192F] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-6 py-2 rounded-md transition-all ${activeTab === 'PENDING' ? 'bg-[#00ED64] text-[#0A192F] font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Pending Approvals
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-6 py-2 rounded-md transition-all ${activeTab === 'ACTIVE' ? 'bg-[#00ED64] text-[#0A192F] font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Active Companies
          </button>
          <button
            onClick={() => setActiveTab('INACTIVE')}
            className={`px-6 py-2 rounded-md transition-all ${activeTab === 'INACTIVE' ? 'bg-red-500 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Inactive / Deleted
          </button>
        </div>

        {/* Search & Add */}
        <div className="flex w-full md:w-auto space-x-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by company or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A192F] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]"
            />
          </div>
          <button
            onClick={() => {
              setFormData({ companyName: '', email: '', designation: '', phone: '', linkedinUrl: '', industry: '', website: '', gstin: '' });
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Manually Add HR</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-[#0A192F] text-gray-400">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Representative</th>
              <th className="px-6 py-4">Email / Phone</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading HRs...</td>
              </tr>
            ) : hrs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No HRs found.</td>
              </tr>
            ) : (
              hrs.map((hr) => (
                <tr key={hr.id} className="border-b border-gray-800 hover:bg-[#0A192F]/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{hr.companyName}</td>
                  <td className="px-6 py-4">
                    <div>{hr.designation}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#00ED64]">{hr.email}</div>
                    <div className="text-xs text-gray-500">{hr.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {hr.isApproved ? (
                      <span className="bg-[#00ED64]/10 text-[#00ED64] px-2 py-1 rounded text-xs font-medium border border-[#00ED64]/20">Active</span>
                    ) : (
                      <span className="bg-yellow-900/50 text-yellow-500 px-2 py-1 rounded text-xs font-medium border border-yellow-800/50">Pending Review</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {activeTab === 'PENDING' ? (
                      <>
                        <button onClick={() => handleApprove(hr.id)} title="Approve" className="text-[#00ED64] hover:text-[#00c954] transition-colors">
                          <CheckCircle size={20} />
                        </button>
                        <button onClick={() => { setSelectedHrId(hr.id); setShowRejectModal(true); }} title="Reject" className="text-red-500 hover:text-red-400 transition-colors">
                          <XCircle size={20} />
                        </button>
                      </>
                    ) : activeTab === 'ACTIVE' ? (
                      <>
                        <button onClick={() => handleView(hr.id)} title="View Details" className="text-gray-400 hover:text-white transition-colors">
                          <Eye size={18} />
                        </button>

                        <button onClick={() => openEditModal(hr)} title="Edit Details" className="text-blue-400 hover:text-blue-300 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleSoftDelete(hr.id)} title="Deactivate (Soft Delete)" className="text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(hr.id)} title="Restore HR" className="text-[#00ED64] hover:text-[#00c954] transition-colors">
                          <RefreshCw size={18} />
                        </button>
                        <button onClick={() => handleHardDelete(hr.id)} title="PERMANENTLY DELETE" className="text-red-600 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit HR Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#112240] rounded-xl border border-gray-800 w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">
                {showAddModal ? "Manually Add Corporate Partner" : "Edit Corporate Partner"}
              </h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-[var(--color-bg-input)] pb-2">
                    Recruiter Details
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:ring-1 focus:ring-[#00ED64] focus:outline-none"
                        placeholder="hr@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <input
                        type="text"
                        name="designation"
                        required
                        value={formData.designation}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:ring-1 focus:ring-[#00ED64] focus:outline-none"
                        placeholder="e.g. Talent Acquisition Lead"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:ring-1 focus:ring-[#00ED64] focus:outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:ring-1 focus:ring-[#00ED64] focus:outline-none"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-[var(--color-bg-input)] pb-2">
                    Company Details
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:ring-1 focus:ring-[#00ED64] focus:outline-none"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      Industry
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:ring-1 focus:ring-[#00ED64] focus:outline-none"
                        placeholder="e.g. Information Technology"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      Company Website
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:ring-1 focus:ring-[#00ED64] focus:outline-none"
                        placeholder="https://acme.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      GSTIN
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
                      <input
                        type="text"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:ring-1 focus:ring-[#00ED64] focus:outline-none"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-800">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex items-center space-x-2 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-2 px-6 rounded-lg transition-colors">
                  <Save size={18} />
                  <span>{showAddModal ? "Save & Send Setup Link" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#112240] rounded-xl border border-gray-800 w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Reject Registration</h3>
              <p className="text-sm text-gray-400 mb-4">Please provide a reason for rejecting this HR. This will be sent to them via email.</p>
              
              <form onSubmit={handleReject}>
                <textarea
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#0A192F] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 h-32 resize-none"
                  placeholder="Enter rejection reason..."
                />
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                    Confirm Reject
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#112240] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-800 animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#0A192F]/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                HR Details
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Company Name</span>
                  <span className="text-white font-semibold">{viewData.companyName}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Email</span>
                  <span className="text-[#00ED64]">{viewData.email}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Designation</span>
                  <span className="text-white">{viewData.designation}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Phone</span>
                  <span className="text-white">{viewData.phone}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Industry</span>
                  <span className="text-white">{viewData.industry || '-'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Website</span>
                  <span className="text-white">{viewData.website ? <a href={viewData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{viewData.website}</a> : '-'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium mb-1">GSTIN</span>
                  <span className="text-white">{viewData.gstin || '-'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Account Status</span>
                  <span className={`font-semibold ${viewData.status === 'ACTIVE' ? 'text-[#00ED64]' : viewData.status === 'PENDING' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {viewData.status}
                  </span>
                </div>
                {viewData.createdBy && (
                  <div className="col-span-2">
                    <span className="block text-gray-500 font-medium mb-1">Added By</span>
                    <span className="text-white bg-gray-800 px-2 py-1 rounded text-xs">{viewData.createdBy.role}: {viewData.createdBy.email}</span>
                  </div>
                )}
                {viewData.updatedBy && (
                  <div className="col-span-2">
                    <span className="block text-gray-500 font-medium mb-1">Last Updated By</span>
                    <span className="text-white bg-gray-800 px-2 py-1 rounded text-xs">{viewData.updatedBy.role}: {viewData.updatedBy.email}</span>
                  </div>
                )}
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Created At</span>
                  <span className="text-white">{new Date(viewData.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-gray-500 font-medium mb-1">Last Updated At</span>
                  <span className="text-white">{new Date(viewData.updatedAt).toLocaleDateString()}</span>
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
