import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, Calendar, MapPin, Building2, Briefcase, Users } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';

const JobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, DRAFT, CLOSED
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectDriveId, setRejectDriveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [viewDrive, setViewDrive] = useState(null);
  
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("newest");
  const debouncedSearch = useDebounce(searchTerm, 1000);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchDrives = async () => {
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

      const response = await api.get(`/admin/job-drives${queryString}`, getAuthHeader());
      setDrives(response.data.data);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch job drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, [page, limit, activeTab, debouncedSearch, sortOption]);
  const handleStatusUpdate = async (id, newStatus) => {
    if (newStatus === 'CANCELLED' && !window.confirm("Are you sure you want to cancel this drive? This will notify scheduled students.")) return;
    if (newStatus === 'REJECTED') {
      setRejectDriveId(id);
      setRejectionReason('');
      setIsRejectModalOpen(true);
      return;
    }
    
    try {
      await api.put(`/admin/job-drives/${id}`, { status: newStatus }, getAuthHeader());
      toast.success(`Job drive marked as ${newStatus}`);
      fetchDrives();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await api.put(`/admin/job-drives/${rejectDriveId}`, { status: 'REJECTED', rejectionReason }, getAuthHeader());
      toast.success("Job drive marked as REJECTED");
      setIsRejectModalOpen(false);
      setRejectDriveId(null);
      setRejectionReason('');
      fetchDrives();
    } catch (error) {
      toast.error("Failed to reject job drive");
    }
  };

  const handleCompleteDrive = async (id) => {
    if (!window.confirm("Are you sure you want to mark this drive as COMPLETED?\n\nAny remaining applicants in the APPLIED or SHORTLISTED stages will be automatically marked as REJECTED and notified.")) return;
    try {
      const response = await api.put(`/admin/job-drives/${id}/complete`, {}, getAuthHeader());
      toast.success(`Job drive marked as COMPLETED. Auto-rejected ${response.data.autoRejectedCount || 0} pending applicants.`);
      fetchDrives();
    } catch (error) {
      toast.error("Failed to complete job drive");
    }
  };



  return (
    <div className="space-y-6 animate-fadeIn w-full pb-8">
      <div className="flex justify-between items-center shrink-0">
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

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div
            className="flex bg-[#0A192F] p-1 rounded-lg border border-gray-800 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto flex-nowrap"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'REJECTED', 'DRAFT', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[#00ED64] text-[#0A192F] font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

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
              <option value="deadline_soon">Ending Soonest</option>
              <option value="deadline_late">Ending Latest</option>
              <option value="salary_high">Highest Salary</option>
              <option value="salary_low">Lowest Salary</option>
              <option value="title_az">Title (A-Z)</option>
              <option value="title_za">Title (Z-A)</option>
            </select>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A192F] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]"
              />
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="flex-1 relative flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ED64]"></div>
          </div>
        )}
        <div className="flex-1 pb-4 flex flex-col">
          {!loading && drives.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-secondary)] min-h-[300px]">
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
              {drives.map((drive) => (
                <div key={drive._id} className="bg-[#112240] border border-gray-800 rounded-xl p-5 hover:border-[#00ED64]/50 transition-all group flex flex-col">

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      {drive.companyId?.logoUrl ? (
                        <img src={drive.companyId.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded bg-white p-1 shrink-0" />
                      ) : null}
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#00ED64] transition-colors">{drive.title}</h3>
                        <div className="flex flex-col mt-2 gap-1">
                          <div className="flex items-center text-[var(--color-text-secondary)] text-sm">
                            <Building2 size={14} className="mr-2" />
                            {drive.companyId?.name || drive.companyName || 'Company'}
                          </div>
                          {drive.postedByHR?.email && (
                            <div className="flex items-center text-[var(--color-text-secondary)] text-sm">
                              <Users size={14} className="mr-2" />
                              {drive.postedByHR.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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

                  <div className="flex flex-col space-y-3 pt-4 border-t border-gray-800">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-semibold text-white">
                        ₹{drive.packageLPA} LPA
                      </div>
                      <div className="text-xs font-semibold px-2 py-1 rounded bg-gray-800 text-gray-300">
                        {drive.status}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end pt-2">
                      {drive.status === 'PENDING_APPROVAL' && (
                        <>
                          <button onClick={() => handleStatusUpdate(drive._id, 'ACTIVE')} className="px-3 py-1 text-xs font-bold rounded bg-green-500/20 text-green-400 hover:bg-green-500/30">
                            Approve
                          </button>
                          <button onClick={() => handleStatusUpdate(drive._id, 'REJECTED')} className="px-3 py-1 text-xs font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                            Reject
                          </button>
                        </>
                      )}
                      
                      {drive.status === 'ACTIVE' && (
                        <>
                          {new Date(drive.deadline) < new Date() && (
                            <button onClick={() => handleCompleteDrive(drive._id)} className="px-3 py-1 text-xs font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                              Mark as Completed
                            </button>
                          )}
                          <button onClick={() => handleStatusUpdate(drive._id, 'CANCELLED')} className="px-3 py-1 text-xs font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                            Cancel Drive
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setViewDrive(drive)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/job-drives/${drive._id}/applications`)}
                        disabled={['PENDING_APPROVAL', 'REJECTED'].includes(drive.status)}
                        className={`p-2 rounded transition-colors ${['PENDING_APPROVAL', 'REJECTED'].includes(drive.status) ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10'}`}
                        title={['PENDING_APPROVAL', 'REJECTED'].includes(drive.status) ? "No applications available" : "View Applications"}
                      >
                        <Users size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/job-drives/edit/${drive._id}`)}
                        disabled={['REJECTED', 'CANCELLED', 'COMPLETED'].includes(drive.status)}
                        className={`p-2 rounded transition-colors ${['REJECTED', 'CANCELLED', 'COMPLETED'].includes(drive.status) ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-400 hover:text-[#00ED64] hover:bg-[#00ED64]/10'}`}
                        title={['REJECTED', 'CANCELLED', 'COMPLETED'].includes(drive.status) ? "Cannot edit drive in this state" : "Edit Drive"}
                      >
                        <Edit2 size={16} />
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              className="mx-2 bg-[#112240] border border-[var(--color-bg-input)] rounded px-2 py-1 text-white focus:outline-none focus:border-[#00ED64]"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={54}>54</option>
            </select>
            <span>cards per page</span>
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

      {/* Modals */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#112240] border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Trash2 className="text-red-500 mr-2" size={20} />
                Reject Job Drive
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-400 mb-4">
                Please provide a reason for rejecting this job drive. This feedback will be emailed to the HR so they can make corrections and resubmit.
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please increase the salary package and fix the typos in the description..."
                className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none h-32"
                required
              />
            </div>
            
            <div className="p-6 border-t border-gray-800 bg-[#0A192F]/50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectDriveId(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/20 transition-all"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Details Modal */}
      {viewDrive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#112240] border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0A192F]">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  {viewDrive.companyId?.logoUrl && (
                    <img src={viewDrive.companyId.logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded bg-white p-1 shrink-0" />
                  )}
                  <h2 className="text-2xl font-bold text-white pr-8">{viewDrive.title}</h2>
                </div>
                <div className="flex items-center text-sm text-[var(--color-text-secondary)]">
                  <span className="mr-4">{viewDrive.companyId?.name || viewDrive.companyName}</span>
                  {viewDrive.postedByHR?.email && (
                    <>
                      <Users size={14} className="mr-1" />
                      <span>{viewDrive.postedByHR.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0A192F] p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Role</p>
                  <p className="font-semibold text-white">{viewDrive.jobRole}</p>
                </div>
                <div className="bg-[#0A192F] p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Package</p>
                  <p className="font-semibold text-[#00ED64]">₹{viewDrive.packageLPA} LPA</p>
                </div>
                <div className="bg-[#0A192F] p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="font-semibold text-white">{viewDrive.location}</p>
                </div>
                <div className="bg-[#0A192F] p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Deadline</p>
                  <p className="font-semibold text-red-400">{new Date(viewDrive.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3 flex items-center border-b border-gray-800 pb-2">
                  <Briefcase className="mr-2 text-[#00ED64]" size={18} />
                  Description
                </h4>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-[#0A192F] p-4 rounded-xl border border-gray-800">
                  {viewDrive.description}
                </div>
                {viewDrive.jdFileUrl && (
                  <div className="mt-3">
                    <a
                      href={viewDrive.jdFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ED64]/10 hover:bg-[#00ED64]/20 border border-[#00ED64]/30 rounded-lg text-xs font-bold text-[#00ED64] transition-all"
                    >
                      <Briefcase size={14} />
                      <span>View Official JD Document (PDF)</span>
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3 flex items-center border-b border-gray-800 pb-2">
                  <Users className="mr-2 text-blue-400" size={18} />
                  Eligibility Criteria
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[#0A192F] p-3 rounded-lg border border-gray-800 flex justify-between">
                    <span className="text-gray-400 text-sm">Min CGPA</span>
                    <span className="text-white font-bold">{viewDrive.minCgpa}</span>
                  </div>
                  <div className="bg-[#0A192F] p-3 rounded-lg border border-gray-800 flex justify-between">
                    <span className="text-gray-400 text-sm">Max Backlogs</span>
                    <span className="text-white font-bold">{viewDrive.maxBacklogs}</span>
                  </div>
                  <div className="bg-[#0A192F] p-3 rounded-lg border border-gray-800 flex justify-between">
                    <span className="text-gray-400 text-sm">Passout Year</span>
                    <span className="text-white font-bold">{viewDrive.passoutYear}</span>
                  </div>
                </div>
                {viewDrive.eligibleBranches && viewDrive.eligibleBranches.length > 0 && (
                  <div className="mt-3 bg-[#0A192F] p-3 rounded-lg border border-gray-800">
                    <span className="text-gray-400 text-sm block mb-2">Eligible Branches</span>
                    <div className="flex flex-wrap gap-2">
                      {viewDrive.eligibleBranches.map(b => (
                        <span key={b} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {viewDrive.rounds && viewDrive.rounds.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center border-b border-gray-800 pb-2">
                    <Calendar className="mr-2 text-purple-400" size={18} />
                    Selection Rounds
                  </h4>
                  <div className="space-y-3">
                    {viewDrive.rounds.map((round, idx) => (
                      <div key={idx} className="bg-[#0A192F] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center">
                        <div className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mb-2 md:mb-0 shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white">{round.name}</p>
                          {round.description && <p className="text-sm text-gray-400 mt-1">{round.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-800 flex items-center justify-end bg-[#0A192F] rounded-b-2xl">
              <button
                onClick={() => setViewDrive(null)}
                className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
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

export default JobDrives;
