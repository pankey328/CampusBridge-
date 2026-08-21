import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Search, ChevronDown, CheckCircle2, Clock, XCircle, ArrowRightCircle, Download, Calendar, Link, Code, FileText, Phone } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import InterviewScheduleModal from '../../components/common/InterviewScheduleModal';
import useDebounce from '../../hooks/useDebounce';

const DriveApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const basePath = userRole === 'HR' ? '/hr' : '/admin';
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortOption, setSortOption] = useState('newest');
  const [totalPages, setTotalPages] = useState(1);
  const [driveStatus, setDriveStatus] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED'];
  const UPDATE_STATUSES = ['APPLIED', 'SHORTLISTED', 'HIRED', 'REJECTED'];

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

      const { data } = await api.get(`${basePath}/job-drives/${id}/applications${queryString}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApplications(data.data);
      if (data.pagination) setTotalPages(data.pagination.totalPages);
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
    if (selectedAppIds.length === applications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(applications.map(app => app._id));
    }
  };

  const toggleSelect = (appId) => {
    if (selectedAppIds.includes(appId)) {
      setSelectedAppIds(selectedAppIds.filter(id => id !== appId));
    } else {
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

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

  return (
    <div className="space-y-6 animate-fadeIn w-full pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        
        {/* Tabs */}
        <div 
          className="flex bg-[#0A192F] p-1 rounded-lg border border-gray-800 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto flex-nowrap"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {['ALL', ...STATUSES].map(status => (
            <button
              key={status}
              onClick={() => { setActiveTab(status); setSelectedAppIds([]); setPage(1); }}
              className={`px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-all ${
                activeTab === status 
                  ? 'bg-[#00ED64] text-[#0A192F] font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col md:flex-row w-full xl:w-auto space-y-3 md:space-y-0 md:space-x-3">
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
            <option value="cgpa_high">Highest CGPA</option>
            <option value="cgpa_low">Lowest CGPA</option>
            <option value="name_az">Name (A-Z)</option>
            <option value="name_za">Name (Z-A)</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full bg-[#0A192F] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]"
            />
          </div>
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
      <div className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-x-auto w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ED64]"></div>
          </div>
        )}
        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-[var(--color-text-secondary)] text-sm border-b border-[var(--color-border)]">
                <th className="px-4 py-3.5 w-12">
                  {!isDriveImmutable && (
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-600 bg-[#0A192F] checked:bg-[#00ED64] cursor-pointer"
                      checked={selectedAppIds.length === applications.length && applications.length > 0}
                      onChange={toggleSelectAll}
                    />
                  )}
                </th>
                <th className="px-4 py-3.5 font-medium">Candidate Info</th>
                <th className="px-4 py-3.5 font-medium">Academics</th>
                <th className="px-4 py-3.5 font-medium">Portfolio</th>
                <th className="px-4 py-3.5 font-medium">Applied Date</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-white text-sm">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="border-b border-[var(--color-border)] hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      {!isDriveImmutable && (
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-600 bg-[#0A192F] checked:bg-[#00ED64] cursor-pointer"
                          checked={selectedAppIds.includes(app._id)}
                          onChange={() => toggleSelect(app._id)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{app.firstName} {app.lastName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{app.rollNumber}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[180px]">{app.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300">{app.branch || 'N/A'}</div>
                      <div className="text-xs mt-0.5">
                        <span className="text-[#00ED64] font-medium mr-2">CGPA: {app.cgpa}</span>
                        <span className="text-red-400 font-medium">Backlogs: {app.activeBacklogs}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
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
                        <div className="flex flex-wrap gap-1 mt-1.5 max-w-[200px]">
                          {app.skills.map((skill, i) => (
                            <span key={i} className="bg-blue-900/30 text-blue-400 border border-blue-800/50 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
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
          <span>applications per page</span>
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
