import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Logo from "./Logo";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("An OTP has been sent to your email.");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/verify-otp-and-reset", {
        email,
        otp,
        newPassword,
        confirmNewPassword,
      });
      toast.success("Password successfully reset! You can now log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F9F7F1] dark:bg-slate-900 transition-colors duration-300">
      <div className="mb-8 w-full flex items-center justify-center">
        <Logo className="w-[180px] sm:w-[220px] h-auto text-[#049669] dark:text-white transition-colors duration-300" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-slate-800 rounded-xl p-8 sm:px-10 shadow-sm border border-gray-200 dark:border-slate-700 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#121212] dark:text-white mb-1">
            Password Recovery
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {step === 1
              ? "Enter your registered email to receive an OTP."
              : "Enter the 6-digit OTP and choose a new password."}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-full text-sm font-bold !text-white bg-[#121212] hover:bg-black dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white dark:border-[#034D35] border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending OTP...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>Send Recovery OTP</span>
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
                6-Digit OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength="6"
                className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
                New password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
                Confirm new password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                className={`block w-full px-4 py-2.5 border ${
                  newPassword &&
                  confirmNewPassword &&
                  newPassword !== confirmNewPassword
                    ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-slate-600 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500"
                } rounded-lg bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none transition-all shadow-sm`}
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              {newPassword &&
                confirmNewPassword &&
                newPassword !== confirmNewPassword && (
                  <p className="text-red-500 text-xs font-medium mt-1.5">
                    Passwords do not match
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                (newPassword !== confirmNewPassword &&
                  confirmNewPassword.length > 0)
              }
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-full text-sm font-bold !text-white bg-[#121212] hover:bg-black dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white dark:border-[#034D35] border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer Navigation - Positioned Outside the Card */}
      <div className="mt-8 flex justify-center text-sm">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-[#121212] dark:text-gray-300 font-medium underline underline-offset-4 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Log In
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
