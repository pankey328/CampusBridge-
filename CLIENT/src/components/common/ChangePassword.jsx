import React, { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { KeyRound, Lock, Save } from "lucide-react";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
          confirmNewPassword,
        },
        getAuthHeader(),
      );

      toast.success(response.data.message || "Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[32px] overflow-hidden shadow-sm animate-fadeIn transition-colors duration-300 w-full max-w-2xl">
      {/* Header Area */}
      <div className="px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-slate-700 bg-[#F9F7F1] dark:bg-slate-900 flex items-center space-x-3 transition-colors duration-300">
        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <KeyRound className="w-5 h-5 text-[#034D35] dark:text-[#B6F596]" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-[#121212] dark:text-white tracking-tight">
            Security
          </h3>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
            Change Password
          </p>
        </div>
      </div>

      {/* Form Area */}
      <form onSubmit={handlePasswordChange} className="p-6 sm:p-8 space-y-6">
        <div className="space-y-5 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] focus:border-[#034D35] dark:focus:border-[#B6F596] transition-all text-sm font-medium"
                placeholder="Enter current password"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] focus:border-[#034D35] dark:focus:border-[#B6F596] transition-all text-sm font-medium"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={`block w-full pl-11 pr-4 py-3 border ${
                  newPassword &&
                  confirmNewPassword &&
                  newPassword !== confirmNewPassword
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-gray-200 dark:border-slate-700 focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] focus:border-[#034D35] dark:focus:border-[#B6F596]"
                } rounded-2xl bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white focus:outline-none transition-all text-sm font-medium`}
                placeholder="Must match new password"
              />
            </div>
            {newPassword &&
              confirmNewPassword &&
              newPassword !== confirmNewPassword && (
                <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-2 pl-1">
                  Passwords do not match
                </p>
              )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-slate-700/80 flex justify-end">
          <button
            type="submit"
            disabled={
              isLoading ||
              (newPassword !== confirmNewPassword &&
                confirmNewPassword.length > 0)
            }
            className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
