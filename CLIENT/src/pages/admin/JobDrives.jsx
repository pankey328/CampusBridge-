import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, Calendar, MapPin, Building2, Briefcase } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const JobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, DRAFT, CLOSED
  const navigate = useNavigate();

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchDrives = async () => {
    try {
      const response = await api.get('/admin/job-drives', getAuthHeader());
      setDrives(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch job drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job drive? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/job-drives/${id}`, getAuthHeader());
      toast.success("Job drive deleted successfully");
      fetchDrives();
    } catch (error) {
      toast.error("Failed to delete job drive");
    }
  };

  const filteredDrives = drives.filter(drive => {
    const titleMatch = drive.title ? drive.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const companyMatch = drive.companyName ? drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesSearch = titleMatch || companyMatch;
    const matchesTab = activeTab === 'ALL' || drive.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Job Drives</h1>
          <p className="text-[var(--color-text-secondary)]">Manage campus placement drives, eligibility, and rounds.</p>
        </div>
        <button
          onClick={() => navigate('/admin/job-drives/create')}
          className="flex items-center space-x-2 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-2 px-6 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Create New Drive</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        {/* Toolbar */}
        <div className="p-6 border-b border-[var(--color-bg-input)] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex space-x-2">
            {['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                    ? 'bg-[#00ED64]/10 text-[#00ED64] border border-[#00ED64]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[var(--color-bg-input)] border border-[var(--color-bg-input)] rounded-lg text-white focus:outline-none focus:border-[#00ED64] w-full md:w-64"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ED64]"></div>
            </div>
          ) : filteredDrives.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)]">
              <Briefcase className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">No job drives found.</p>
              <button
                onClick={() => navigate('/admin/job-drives/create')}
                className="mt-4 text-[#00ED64] hover:underline"
              >
                Create the first one
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrives.map((drive) => (
                <div key={drive._id} className="bg-[#112240] border border-gray-800 rounded-xl p-5 hover:border-[#00ED64]/50 transition-all group flex flex-col">

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00ED64] transition-colors">{drive.title}</h3>
                      <div className="flex items-center text-[var(--color-text-secondary)] text-sm mt-1">
                        <Building2 size={14} className="mr-1" />
                        {drive.companyId?.name || drive.companyName || 'Company'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${drive.status === 'ACTIVE' ? 'bg-[#00ED64]/10 text-[#00ED64] border-[#00ED64]/20' :
                        drive.status === 'DRAFT' ? 'bg-gray-800 text-gray-300 border-gray-700' :
                          drive.status === 'PENDING_APPROVAL' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-700/50' :
                            'bg-red-900/30 text-red-500 border-red-700/50'
                      }`}>
                      {drive.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
                      <Briefcase size={14} className="mr-2" />
                      Role: {drive.jobRole}
                    </div>
                    <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
                      <MapPin size={14} className="mr-2" />
                      {drive.location || 'Not Specified'}
                    </div>
                    <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
                      <Calendar size={14} className="mr-2" />
                      Deadline: {new Date(drive.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="text-sm font-semibold text-white">
                      ₹{drive.packageLPA} LPA
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/job-drives/edit/${drive._id}`)}
                        className="p-2 text-gray-400 hover:text-[#00ED64] hover:bg-[#00ED64]/10 rounded transition-colors"
                        title="Edit Drive"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(drive._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete Drive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDrives;
