import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NotificationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/notifications', getAuthHeader());
      setLogs(response.data);
    } catch (error) {
      toast.error('Failed to fetch notification logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleResend = async (id) => {
    try {
      setResendingId(id);
      const response = await api.post(`/admin/notifications/${id}/resend`, {}, getAuthHeader());
      toast.success(response.data.message || 'Email resent successfully');
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setResendingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="flex items-center text-[#00ED64] bg-[#00ED64]/10 px-2 py-1 rounded text-xs font-medium border border-[#00ED64]/20"><CheckCircle2 size={12} className="mr-1" /> Delivered</span>;
      case 'FAILED':
        return <span className="flex items-center text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-medium border border-red-500/20"><AlertCircle size={12} className="mr-1" /> Failed</span>;
      default:
        return <span className="flex items-center text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded text-xs font-medium border border-yellow-500/20"><Clock size={12} className="mr-1" /> Pending</span>;
    }
  };

  if (loading) {
    return <div className="text-white p-8">Loading notifications...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Mail className="text-[#00ED64]" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Email & Notification Logs</h1>
          <p className="text-sm text-gray-400">Monitor system emails and resend failed messages</p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-gray-400 text-sm border-b border-[var(--color-border)]">
                <th className="p-4 font-medium">Recipient</th>
                <th className="p-4 font-medium">Subject</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Attempts</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">No logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-[var(--color-border)] hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{log.recipientEmail}</div>
                      <div className="text-xs text-gray-500">{log.type}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-300 truncate max-w-xs" title={log.subject}>{log.subject}</div>
                      {log.errorMessage && (
                        <div className="text-xs text-red-400 mt-1 truncate max-w-xs" title={log.errorMessage}>
                          Error: {log.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-center text-gray-400">
                      {log.attempts}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleResend(log._id)}
                        disabled={resendingId === log._id}
                        className="p-2 bg-[#0A192F] border border-gray-700 hover:border-[#00ED64] hover:text-[#00ED64] text-gray-400 rounded transition-colors disabled:opacity-50"
                        title="Resend Email"
                      >
                        <RefreshCw size={16} className={resendingId === log._id ? "animate-spin" : ""} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotificationLogs;
