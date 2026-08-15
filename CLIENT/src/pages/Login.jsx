import { React, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../redux/authSlice";
import { LogIn, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Dispatch the Async Thunk
      const resultAction = await dispatch(
        loginUser({ email, password }),
      ).unwrap();

      if (resultAction.mustChangePassword) {
        toast("Please change your temporary password to continue.", {
          icon: "⚠️",
        });
        navigate("/force-password-change", { state: { token: resultAction.token } });
        return;
      }

      toast.success("Welcome back to CampusBridge!");

      // RBAC
      const role = resultAction.user.role;
      if (role === "SUPERADMIN" || role === "TPO") navigate("/admin/dashboard");
      else if (role === "HR") navigate("/hr/dashboard");
      else navigate("/student/dashboard");
    } catch (error) {
      toast.error(error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-input)] mb-4 border border-[var(--color-brand-primary)]">
            <LogIn className="w-8 h-8 text-[var(--color-brand-primary)]" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            CampusBridge
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Enterprise Placement Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="director@campusbridge.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-[var(--color-bg-input)] rounded-lg bg-[var(--color-bg-input)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-[var(--color-bg-dark)] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          Corporate Recruiter?{" "}
          <a
            href="/register-hr"
            className="font-bold text-[var(--color-brand-primary)] hover:underline"
          >
            Apply for an account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
