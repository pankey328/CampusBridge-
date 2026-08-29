import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

const ForcePasswordChange = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await api.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
          confirmNewPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Password changed successfully! You can now log in.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F9F7F1] dark:bg-slate-900 transition-colors duration-300">
      <div className="mb-8 w-full flex items-center justify-center">
        <Logo className="w-[180px] sm:w-[220px] h-auto text-[#049669] dark:text-white transition-colors duration-300" />
      </div>

      {/* Main Password Change Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-800 rounded-xl p-8 sm:px-10 shadow-sm border border-gray-200 dark:border-slate-700 transition-all duration-300">
        <h2 className="text-center text-xl font-bold text-[#121212] dark:text-white mb-1">
          Update Password
        </h2>
        <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
          Please set a permanent password before continuing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
              Temporary password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
              New password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
              Confirm new password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
              placeholder="Re-enter new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-full text-sm font-bold !text-white bg-[#121212] hover:bg-black dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white dark:border-[#034D35] border-t-transparent rounded-full animate-spin"></div>
                <span>Updating Password...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span>Save New Password</span>
                <ArrowRight size={16} />
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
