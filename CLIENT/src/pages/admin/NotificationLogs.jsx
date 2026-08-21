import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle2, Clock, RefreshCw, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';

const NotificationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);

  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortOption, setSortOption] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let queryString = `?page=${page}&limit=${limit}&sort=${sortOption}&status=${activeStatus}`;
      if (debouncedSearch) {
        queryString += `&search=${debouncedSearch}`;
      }
      if (selectedType !== 'ALL') {
        queryString += `&type=${selectedType}`;
      }

      const response = await api.get(`/admin/notifications${queryString}`, getAuthHeader());
      setLogs(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalDocuments(response.data.pagination.totalDocuments);
      }
    } catch (error) {
      toast.error('Failed to fetch notification logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, sortOption, activeStatus, selectedType, debouncedSearch]);

  const handleResend = async (id) => {
    try {
      setResendingId(id);
      const response = await api.post(`/admin/notifications/${id}/resend`, {}, getAuthHeader());
      toast.success(response.data.message || 'Email resent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setResendingId(null);
      fetchLogs();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center text-[#00ED64] bg-[#00ED64]/10 px-2.5 py-1 rounded-full text-xs font-semibold border border-[#00ED64]/20">
            <CheckCircle2 size={12} className="mr-1" /> Delivered
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center text-red-400 bg-red-900/30 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-800/50">
            <AlertCircle size={12} className="mr-1" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-yellow-400 bg-yellow-900/30 px-2.5 py-1 rounded-full text-xs font-semibold border border-yellow-800/50">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full pb-8">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Email & Notification Logs</h1>
          <p className="text-gray-400">Monitor system emails, search by recipient or mail type, and sort by date.</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Status Tabs */}
        <div className="flex bg-[#0A192F] p-1 rounded-lg border border-gray-800 flex-wrap sm:flex-nowrap">
          {['ALL', 'DELIVERED', 'FAILED', 'PENDING'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setActiveStatus(status);
                setPage(1);
              }}
              className={`px-5 py-2 rounded-md transition-all text-sm font-medium ${
                activeStatus === status
                  ? 'bg-[#00ED64] text-[#0A192F] font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search, Type Filter & Date Sort */}
        <div className="flex flex-col sm:flex-row w-full xl:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Email Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="bg-[#0A192F] border border-gray-700 text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:border-[#00ED64]"
          >
            <option value="ALL">All Mail Types</option>
            <option value="WELCOME">Welcome / Setup</option>
            <option value="HR_ACTIVATION">HR Activation</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="REASSIGNED">Slot Reassigned</option>
            <option value="INTERVIEW_CANCELLED">Interview Cancelled</option>
            <option value="APPLICATION_SHORTLISTED">Shortlisted</option>
            <option value="APPLICATION_HIRED">Hired / Offer</option>
            <option value="APPLICATION_REJECTED">Application Rejected</option>
            <option value="GENERAL">General Notice</option>
          </select>

          {/* Date Sorting */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            className="bg-[#0A192F] border border-gray-700 text-white px-4 py-2 text-sm rounded-lg focus:outline-none focus:border-[#00ED64]"
          >
            <option value="newest">Date: Newest First</option>
            <option value="oldest">Date: Oldest First</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by email, mail type, subject..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0A192F] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64]"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="relative rounded-xl border border-gray-800 overflow-x-auto w-full bg-[#0A192F]/50 shadow-inner">
        <table className="w-full table-fixed text-left text-sm text-gray-300 min-h-[250px]">
          <thead className="text-xs uppercase bg-[#0A192F] text-gray-400 border-b border-gray-800">
            <tr>
              <th className="px-4 py-3.5 w-[22%]">Recipient</th>
              <th className="px-4 py-3.5 w-[18%]">Mail Type</th>
              <th className="px-4 py-3.5 w-[28%]">Subject</th>
              <th className="px-4 py-3.5 w-[16%]">Date & Time</th>
              <th className="px-4 py-3.5 w-[6%] text-center">Attempts</th>
              <th className="px-4 py-3.5 w-[10%]">Status</th>
              <th className="px-4 py-3.5 w-[8%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00ED64] mb-2"></div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <Mail className="w-12 h-12 mb-3 opacity-30 mx-auto" />
                  <p className="text-base font-medium text-gray-400">No email notification logs found.</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-800 hover:bg-[#0A192F]/50 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-white truncate" title={log.recipientEmail}>
                    {log.recipientEmail}
                  </td>
                  <td className="px-4 py-3.5 truncate">
                    <span className="text-xs font-mono bg-[#112240] px-2 py-0.5 rounded text-[#00ED64] border border-gray-800 truncate inline-block max-w-full">
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-gray-300 truncate font-medium" title={log.subject}>
                      {log.subject}
                    </div>
                    {log.errorMessage && (
                      <div className="text-xs text-red-400 mt-0.5 truncate" title={log.errorMessage}>
                        Error: {log.errorMessage}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs truncate" title={new Date(log.createdAt).toLocaleString()}>
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-400 font-mono">
                    {log.attempts}
                  </td>
                  <td className="px-4 py-3.5">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleResend(log._id)}
                      disabled={resendingId === log._id}
                      className="p-1.5 bg-[#0A192F] border border-gray-700 hover:border-[#00ED64] hover:text-[#00ED64] text-gray-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Resend Email"
                    >
                      <RefreshCw size={15} className={resendingId === log._id ? 'animate-spin text-[#00ED64]' : ''} />
                    </button>
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
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>logs per page</span>
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
                  ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                  : 'border-gray-600 text-gray-300 hover:text-white hover:border-[#00ED64]'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                page === totalPages || totalPages === 0
                  ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                  : 'border-gray-600 text-gray-300 hover:text-white hover:border-[#00ED64]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationLogs;
