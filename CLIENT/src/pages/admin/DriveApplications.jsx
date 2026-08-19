import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Search, ChevronDown, CheckCircle2, Clock, XCircle, ArrowRightCircle, Download, Calendar, Link, Code, FileText, Phone } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import InterviewScheduleModal from '../../components/common/InterviewScheduleModal';

const DriveApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const basePath = userRole === 'HR' ? '/hr' : '/admin';
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [driveStatus, setDriveStatus] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED'];
  const UPDATE_STATUSES = ['APPLIED', 'SHORTLISTED', 'HIRED', 'REJECTED'];

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get(`${basePath}/job-drives/${id}/applications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApplications(data.data);
      if (data.driveStatus) setDriveStatus(data.driveStatus);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`${basePath}/applications/${appId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Status updated');
      setApplications(applications.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkUpdate = async (newStatus) => {
    if (selectedAppIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await api.put(`${basePath}/applications/bulk`, { 
        applicationIds: selectedAppIds, 
        status: newStatus 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success(`Successfully updated ${selectedAppIds.length} students to ${newStatus}`);
      setApplications(applications.map(app => 
        selectedAppIds.includes(app._id) ? { ...app, status: newStatus } : app
      ));
      setSelectedAppIds([]);
    } catch (error) {
      toast.error('Failed to update applications');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedAppIds.length === filteredApplications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApplications.map(app => app._id));
    }
  };

  const toggleSelect = (appId) => {
    if (selectedAppIds.includes(appId)) {
      setSelectedAppIds(selectedAppIds.filter(id => id !== appId));
    } else {
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesTab = activeTab === 'ALL' || app.status === activeTab;
    const matchesSearch = 
      (app.firstName + ' ' + app.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const isDriveImmutable = ['CANCELLED', 'COMPLETED', 'DRAFT', 'PENDING_APPROVAL', 'REJECTED'].includes(driveStatus);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED': return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-medium">Applied</span>;
      case 'SHORTLISTED': return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-xs font-medium">Shortlisted</span>;
      case 'INTERVIEW_SCHEDULED': return <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-xs font-medium">Interviewing</span>;
      case 'HIRED': return <span className="px-2 py-1 bg-[#00ED64]/10 text-[#00ED64] border border-[#00ED64]/20 rounded text-xs font-medium">Hired</span>;
      case 'REJECTED': return <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-medium">Rejected</span>;
      default: return null;
    }
  };

  if (loading) return <div className="text-white p-8">Loading applications...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`${basePath}/job-drives`)}
            className="p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Drive Applications</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Manage and shortlist candidates</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['ALL', ...STATUSES].map(status => (
            <button
              key={status}
              onClick={() => { setActiveTab(status); setSelectedAppIds([]); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === status 
                  ? 'bg-[var(--color-brand-primary)] text-[#001E2B]' 
                  : 'text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, roll, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A192F] border border-[var(--color-border)] text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#00ED64]"
          />
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedAppIds.length > 0 && !isDriveImmutable && (
        <div className="bg-[#112240] border border-[#00ED64]/50 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(0,237,100,0.1)] animate-fade-in-up">
          <div className="flex items-center text-white font-medium">
            <CheckSquare className="text-[#00ED64] mr-3" size={20} />
            {selectedAppIds.length} candidate{selectedAppIds.length > 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400 mr-2">Bulk Update Status:</span>
            {UPDATE_STATUSES.map(status => (
              <button
                key={status}
                onClick={() => handleBulkUpdate(status)}
                disabled={isBulkUpdating}
                className="px-3 py-1.5 bg-[#0A192F] border border-gray-700 hover:border-[#00ED64] hover:text-[#00ED64] text-gray-300 text-xs font-semibold rounded transition-colors disabled:opacity-50"
              >
                {status.replace('_', ' ')}
              </button>
            ))}
            
            <div className="w-px h-6 bg-gray-700 mx-2"></div>
            
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-1.5 bg-[#00ED64] text-[#0A192F] hover:bg-[#00c954] text-xs font-bold rounded flex items-center transition-colors shadow-lg shadow-[#00ED64]/20"
            >
              <Calendar size={14} className="mr-1" />
              Schedule Interviews
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-visible">
        <div className="overflow-visible w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-[var(--color-text-secondary)] text-sm border-b border-[var(--color-border)]">
                <th className="p-4 w-12">
                  {!isDriveImmutable && (
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-600 bg-[#0A192F] checked:bg-[#00ED64] cursor-pointer"
                      checked={selectedAppIds.length === filteredApplications.length && filteredApplications.length > 0}
                      onChange={toggleSelectAll}
                    />
                  )}
                </th>
                <th className="p-4 font-medium">Candidate Info</th>
                <th className="p-4 font-medium">Academics</th>
                <th className="p-4 font-medium">Portfolio</th>
                <th className="p-4 font-medium">Applied Date</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-white text-sm">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No applications found.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app._id} className="border-b border-[var(--color-border)] hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      {!isDriveImmutable && (
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-600 bg-[#0A192F] checked:bg-[#00ED64] cursor-pointer"
                          checked={selectedAppIds.includes(app._id)}
                          onChange={() => toggleSelect(app._id)}
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{app.firstName} {app.lastName}</div>
                      <div className="text-xs text-gray-400 mt-1">{app.rollNumber}</div>
                      <div className="text-xs text-gray-500">{app.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300">{app.branch || 'N/A'}</div>
                      <div className="text-xs mt-1">
                        <span className="text-[#00ED64] font-medium mr-3">CGPA: {app.cgpa}</span>
                        <span className="text-red-400 font-medium">Backlogs: {app.activeBacklogs}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3 text-gray-400">
                        {app.resumeUrl ? (
                          <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#00ED64] transition-colors" title="View Resume">
                            <FileText size={16} />
                          </a>
                        ) : <FileText size={16} className="opacity-30" title="No Resume" />}
                        
                        {app.linkedinUrl ? (
                          <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" title="LinkedIn Profile">
                            <Link size={16} />
                          </a>
                        ) : <Link size={16} className="opacity-30" title="No LinkedIn" />}
                        
                        {app.githubUrl ? (
                          <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="GitHub Profile">
                            <Code size={16} />
                          </a>
                        ) : <Code size={16} className="opacity-30" title="No GitHub" />}
                        
                        {app.phone ? (
                          <a href={`tel:${app.phone}`} className="hover:text-[#00ED64] transition-colors" title={app.phone}>
                            <Phone size={16} />
                          </a>
                        ) : <Phone size={16} className="opacity-30" title="No Phone" />}
                      </div>
                      {app.skills && app.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 max-w-[200px]">
                          {app.skills.map((skill, i) => (
                            <span key={i} className="bg-blue-900/30 text-blue-400 border border-blue-800/50 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="relative group/dropdown">
                        <div className="cursor-pointer">
                          {getStatusBadge(app.status)}
                        </div>
                        {/* Dropdown on Hover */}
                        {!isDriveImmutable && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-[#112240] border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-10 py-1">
                            {UPDATE_STATUSES.map(s => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(app._id, s)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${app.status === s ? 'text-[#00ED64] bg-[#00ED64]/10' : 'text-gray-300'}`}
                              >
                                {s.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Interviews Modal */}
      <InterviewScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        selectedStudents={applications.filter(app => selectedAppIds.includes(app._id))}
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
