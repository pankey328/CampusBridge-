import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, RefreshCw, X, Save, Eye, ExternalLink } from 'lucide-react';
import api from '../../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // ACTIVE or INACTIVE
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewData, setViewData] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
    branch: '',
    passoutYear: new Date().getFullYear(),
    cgpa: 0,
    activeBacklogs: 0,
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/students?status=${activeTab}&search=${searchTerm}`, getAuthHeader());
      setStudents(data.data || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Searching
    const timeout = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(timeout);
  }, [activeTab, searchTerm]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students/manual', formData, getAuthHeader());
      setShowAddModal(false);
      setFormData({ firstName: '', lastName: '', email: '', rollNumber: '', branch: '', passoutYear: new Date().getFullYear(), cgpa: 0, activeBacklogs: 0 });

      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add student");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/students/${selectedStudent.id}`, formData, getAuthHeader());
      setShowEditModal(false);
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update student");
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
      setShowViewModal(true);
    } catch (error) {
      alert("Failed to fetch student details");
    }
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this student? They won't be able to log in.")) {
      try {
        await api.put(`/admin/students/${id}/soft`, {}, getAuthHeader());
        fetchStudents();
      } catch (error) {
        alert("Failed to deactivate student");
      }
    }
  };

  const handleHardDelete = async (id) => {
    if (window.confirm("WARNING: This will permanently delete the student and all their data. Proceed?")) {
      try {
        await api.delete(`/admin/students/${id}/hard`, getAuthHeader());
        fetchStudents();
      } catch (error) {
        alert("Failed to delete student permanently");
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/admin/students/${id}/restore`, {}, getAuthHeader());
      fetchStudents();
    } catch (error) {
      alert("Failed to restore student");
    }
  };

  const handleToggleLock = async (id) => {
    try {
      await api.put(`/admin/students/${id}/lock`, {}, getAuthHeader());
      fetchStudents();
    } catch (error) {
      alert("Failed to toggle lock status");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        {/* Tabs */}
        <div className="flex bg-[#0A192F] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-6 py-2 rounded-md transition-all ${activeTab === 'ACTIVE' ? 'bg-[#00ED64] text-[#0A192F] font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-6 py-2 rounded-md transition-all ${activeTab === 'PENDING' ? 'bg-yellow-500 text-[#0A192F] font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('INACTIVE')}
            className={`px-6 py-2 rounded-md transition-all ${activeTab === 'INACTIVE' ? 'bg-red-500 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            Inactive
          </button>
        </div>

        {/* Search & Add */}
        <div className="flex w-full md:w-auto space-x-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A192F] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]"
            />
          </div>
          <button
            onClick={() => {
              setFormData({ firstName: '', lastName: '', email: '', rollNumber: '', branch: '', passoutYear: new Date().getFullYear(), cgpa: 0, activeBacklogs: 0 });
              setShowAddModal(true);
            }}
            className="flex items-center space-x-2 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-[#0A192F] text-gray-400">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Enrollment No.</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Branch/Year</th>
              <th className="px-6 py-4">Apply Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading students...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No students found.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="border-b border-gray-800 hover:bg-[#0A192F]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-[#00ED64]">{student.email}</td>
                  <td className="px-6 py-4">{student.branch || '-'} ({student.passoutYear})</td>
                  <td className="px-6 py-4">
                    {student.isLocked ? (
                      <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded text-xs font-medium border border-red-800/50 flex items-center w-fit gap-1">
                        <Shield size={12} /> Locked
                      </span>
                    ) : (
                      <span className="bg-[#00ED64]/10 text-[#00ED64] px-2 py-1 rounded text-xs font-medium border border-[#00ED64]/20">
                        Allowed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {/* Toggle Apply Lock Button */}
                    <button
                      onClick={() => handleToggleLock(student.id)}
                      title={student.isLocked ? "Unlock Applications" : "Lock Applications"}
                      className={`transition-colors ${student.isLocked ? 'text-green-500 hover:text-green-400' : 'text-orange-500 hover:text-orange-400'}`}
                    >
                      <Shield size={18} />
                    </button>

                    {/* View Button */}
                    <button onClick={() => handleView(student.id)} title="View Details" className="text-gray-400 hover:text-white transition-colors">
                      <Eye size={18} />
                    </button>

                    {/* Edit Button */}
                    <button onClick={() => openEditModal(student)} title="Edit Details" className="text-blue-400 hover:text-blue-300 transition-colors">
                      <Edit2 size={18} />
                    </button>

                    {/* Soft/Hard Delete and Restore */}
                    {activeTab !== 'INACTIVE' ? (
                      <button onClick={() => handleSoftDelete(student.id)} title="Deactivate (Soft Delete)" className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(student.id)} title="Restore Student" className="text-[#00ED64] hover:text-[#00c954] transition-colors">
                          <RefreshCw size={18} />
                        </button>
                        <button onClick={() => handleHardDelete(student.id)} title="PERMANENTLY DELETE" className="text-red-600 hover:text-red-500 transition-colors">
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

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#112240] rounded-xl border border-gray-800 w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">

            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">
                {showAddModal ? "Manually Add Student" : "Edit Student Details"}
              </h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ED64]" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ED64]" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Email <span className="text-red-500">*</span></label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ED64]" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Enrollment / Roll No. <span className="text-red-500">*</span></label>
                  <input type="text" name="rollNumber" required value={formData.rollNumber} onChange={handleInputChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ED64]" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Branch</label>
                  <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ED64]" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Passout Year</label>
                  <input type="number" name="passoutYear" value={formData.passoutYear} onChange={handleInputChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ED64]" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">CGPA</label>
                  <input type="number" step="0.01" min="0" max="10" name="cgpa" value={formData.cgpa} onChange={handleInputChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ED64]" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Active Backlogs</label>
                  <input type="number" min="0" name="activeBacklogs" value={formData.activeBacklogs} onChange={handleInputChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ED64]" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-800">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex items-center space-x-2 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-2 px-6 rounded-lg transition-colors">
                  <Save size={18} />
                  <span>{showAddModal ? "Save & Send Email" : "Update Student"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#112240] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-800 animate-fadeIn">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-800 flex justify-between items-start bg-[#0A192F]/80 shrink-0">
              <div className="flex gap-5 items-center">
                <div className="w-16 h-16 rounded-full bg-[#00ED64]/10 flex items-center justify-center text-[#00ED64] text-2xl font-bold border border-[#00ED64]/20 shadow-inner">
                  {viewData.firstName[0]}{viewData.lastName[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    {viewData.firstName} {viewData.lastName}
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${viewData.status === 'ACTIVE' ? 'bg-[#00ED64]/10 text-[#00ED64] border-[#00ED64]/20' : viewData.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {viewData.status}
                    </span>
                  </h3>
                  <p className="text-gray-400 mt-1 flex items-center gap-2">
                    <span>{viewData.email}</span>
                    <span className="text-gray-600">•</span>
                    <span className="font-mono text-gray-300">{viewData.rollNumber}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-700/80 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 overflow-y-auto bg-[#0A192F]/30 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Academic Details Card */}
                  <div className="bg-[#112240] border border-gray-800 p-6 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00ED64]/50 group-hover:bg-[#00ED64] transition-colors"></div>
                    <h4 className="text-white font-semibold mb-5 flex items-center gap-2 border-b border-gray-800/50 pb-3">
                      Academic Profile
                    </h4>
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                      <div>
                        <span className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Branch</span>
                        <span className="text-gray-200">{viewData.branch || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Passout Year</span>
                        <span className="text-gray-200">{viewData.passoutYear}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">CGPA</span>
                        <span className="text-white font-medium text-lg">{viewData.cgpa || '0'}</span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider font-semibold">Active Backlogs</span>
                        <span className={`font-medium text-lg ${viewData.activeBacklogs > 0 ? 'text-red-400' : 'text-[#00ED64]'}`}>{viewData.activeBacklogs || '0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio & Contact Card */}
                  <div className="bg-[#112240] border border-gray-800 p-6 rounded-xl shadow-sm">
                    <h4 className="text-white font-semibold mb-5 flex items-center gap-2 border-b border-gray-800/50 pb-3">
                      Contact & Portfolio
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-[#0A192F]/50 p-3 rounded-lg border border-gray-800/50">
                        <span className="text-sm text-gray-400">Phone</span>
                        <span className="text-gray-200 text-sm font-medium">{viewData.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-[#0A192F]/50 p-3 rounded-lg border border-gray-800/50">
                        <span className="text-sm text-gray-400">LinkedIn</span>
                        {viewData.linkedinUrl ? <a href={viewData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1.5 font-medium transition-colors">View Profile <ExternalLink size={14}/></a> : <span className="text-gray-600 text-sm">-</span>}
                      </div>
                      <div className="flex justify-between items-center bg-[#0A192F]/50 p-3 rounded-lg border border-gray-800/50">
                        <span className="text-sm text-gray-400">GitHub</span>
                        {viewData.githubUrl ? <a href={viewData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1.5 font-medium transition-colors">View Profile <ExternalLink size={14}/></a> : <span className="text-gray-600 text-sm">-</span>}
                      </div>
                      <div className="flex justify-between items-center bg-[#00ED64]/5 p-3 rounded-lg border border-[#00ED64]/10">
                        <span className="text-sm text-gray-400">Resume</span>
                        {viewData.resumeUrl ? <a href={viewData.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-[#00ED64] hover:text-[#00c954] text-sm flex items-center gap-1.5 font-bold transition-colors">Download Resume <ExternalLink size={14}/></a> : <span className="text-gray-600 text-sm">-</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Skills Card */}
                  <div className="bg-[#112240] border border-gray-800 p-6 rounded-xl shadow-sm">
                    <h4 className="text-white font-semibold mb-5 flex items-center gap-2 border-b border-gray-800/50 pb-3">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {viewData.skills && viewData.skills.length > 0 ? (
                        viewData.skills.map((skill, i) => (
                          <span key={i} className="bg-[#0A192F] text-gray-300 border border-gray-700 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <div className="w-full text-center py-6 border border-dashed border-gray-800 rounded-lg">
                          <span className="text-gray-500 text-sm italic">No skills listed yet</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Details Card */}
                  <div className="bg-[#112240] border border-gray-800 p-6 rounded-xl shadow-sm">
                    <h4 className="text-gray-400 font-semibold mb-5 flex items-center gap-2 border-b border-gray-800/50 pb-3">
                      System Details
                    </h4>
                    <div className="space-y-5">
                      <div className="flex justify-between items-center bg-[#0A192F] p-4 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${viewData.isLocked ? 'bg-red-500/10 text-red-500' : 'bg-[#00ED64]/10 text-[#00ED64]'}`}>
                            <Shield size={18} />
                          </div>
                          <div>
                            <span className="block text-sm text-gray-300 font-medium">Application Lock</span>
                            <span className="block text-xs text-gray-500 mt-0.5">Controls if student can apply</span>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${viewData.isLocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#00ED64]/20 text-[#00ED64] border border-[#00ED64]/30'}`}>
                          {viewData.isLocked ? 'LOCKED' : 'ALLOWED'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 bg-[#0A192F]/50 p-4 rounded-xl border border-gray-800/50">
                        <div>
                          <span className="block text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Created At</span>
                          <span className="text-gray-300 text-sm">{new Date(viewData.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Last Updated</span>
                          <span className="text-gray-300 text-sm">{new Date(viewData.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {viewData.createdBy && (
                          <div className="col-span-2 pt-2 border-t border-gray-800/50">
                            <span className="block text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Added By</span>
                            <span className="text-gray-400 text-xs font-mono bg-[#0A192F] px-2 py-1 rounded inline-block border border-gray-800">{viewData.createdBy.role}: {viewData.createdBy.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
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

export default StudentManagement;
