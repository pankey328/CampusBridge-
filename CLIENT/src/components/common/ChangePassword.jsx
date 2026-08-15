import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { KeyRound, Lock, Save } from 'lucide-react';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(
        '/auth/change-password',
        {
          currentPassword,
          newPassword,
          confirmNewPassword
        },
        getAuthHeader()
      );

      toast.success(response.data.message || 'Password changed successfully!');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#112240] border border-gray-800 rounded-xl overflow-hidden shadow-lg animate-fadeIn">
      <div className="px-6 py-4 border-b border-gray-800 bg-[#0A192F]/50 flex items-center space-x-3">
        <div className="p-2 bg-[#00ED64]/10 rounded-lg">
          <KeyRound className="w-5 h-5 text-[#00ED64]" />
        </div>
        <h3 className="text-lg font-semibold text-white">Change Password</h3>
      </div>

      <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
        <div className="space-y-4 max-w-2xl">
          
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-[#0A192F] text-white focus:outline-none focus:ring-1 focus:ring-[#00ED64] transition-all"
                placeholder="Enter current password"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-[#0A192F] text-white focus:outline-none focus:ring-1 focus:ring-[#00ED64] transition-all"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-[#0A192F] text-white focus:outline-none focus:ring-1 focus:ring-[#00ED64] transition-all"
                placeholder="Must match new password"
              />
            </div>
          </div>

        </div>

        <div className="pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
