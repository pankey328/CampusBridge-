import { React, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { Lock, CheckCircle } from "lucide-react";

const SetupPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [id, setId] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    const idParam = params.get("id");

    if (tokenParam && idParam) {
      setToken(tokenParam);
      setId(idParam);
    } else {
      toast.error("Invalid setup link. Missing token or ID.");
      navigate("/login");
    }
  }, [location.search, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/setup-password", {
        id,
        token,
        newPassword,
        confirmNewPassword
      });

      toast.success(response.data.message || "Password setup successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to setup password. Link may be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)] transition-colors duration-300">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-input)] mb-4 border border-[var(--color-border)] shadow-sm">
            <CheckCircle className="w-8 h-8 text-[var(--color-brand-primary)]" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Account Activation
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Set your password to activate your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="block w-full pl-10 pr-3 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all shadow-sm"
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
                className="block w-full pl-10 pr-3 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-input)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all shadow-sm"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-[#001E2B] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin"></div>
                <span>Activating...</span>
              </div>
            ) : (
              "Activate Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPassword;
