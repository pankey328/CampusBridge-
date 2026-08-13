import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-input)] mb-4 border border-[var(--color-brand-primary)]">
            <KeyRound className="w-8 h-8 text-[var(--color-brand-primary)]" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Password Recovery
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            {step === 1
              ? "Enter your email to receive an OTP."
              : "Enter the OTP and your new password."}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--color-text-secondary)]" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all"
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-[var(--color-bg-dark)] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)] transition-all disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send OTP"}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                6-Digit OTP
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="block w-full px-4 py-3 border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--color-text-secondary)]" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--color-text-secondary)]" />
                </div>
                <input
                  type="password"
                  required
                  className={`block w-full pl-10 pr-3 py-3 border ${newPassword && confirmNewPassword && newPassword !== confirmNewPassword ? "border-red-500 focus:ring-red-500" : "border-[var(--color-bg-input)] focus:ring-[var(--color-brand-primary)]"} rounded-lg bg-[var(--color-bg-input)] text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              {newPassword &&
                confirmNewPassword &&
                newPassword !== confirmNewPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={isLoading || newPassword !== confirmNewPassword}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-[var(--color-bg-dark)] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)] transition-all disabled:opacity-50"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
