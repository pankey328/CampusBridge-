import { React, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../redux/authSlice";
import { Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";
import Logo from "./Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(
        loginUser({ email, password }),
      ).unwrap();

      if (resultAction.mustChangePassword) {
        toast("Please change your temporary password to continue.", {
          icon: "⚠️",
        });
        navigate("/force-password-change", {
          state: { token: resultAction.token },
        });
        return;
      }

      toast.success("Welcome back to CampusBridge!");

      const role = resultAction.user.role;
      localStorage.setItem("role", role);
      if (role === "SUPERADMIN") navigate("/superadmin/dashboard");
      else if (role === "TPO") navigate("/admin/dashboard");
      else if (role === "HR") navigate("/hr/dashboard");
      else navigate("/student/dashboard");
    } catch (error) {
      toast.error(error || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 bg-[#B6F596] dark:bg-[#012a1d] relative items-center justify-center p-8 xl:p-12 overflow-hidden h-full">
        <svg
          className="absolute inset-0 w-full h-full text-[#034D35]/10 dark:text-[#B6F596]/10"
          fill="none"
        >
          <path
            d="M 0 500 C 300 500, 300 200, 600 200"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M -100 600 C 400 600, 400 300, 800 300"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/40 dark:bg-white/10 border border-[#034D35]/10 dark:border-white/10 rounded-full px-4 py-1.5 text-xs text-[#034D35] dark:text-[#9ad97a] font-bold uppercase tracking-wider">
            <Sparkles size={16} />
            <span>Platform Access</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-[#034D35] dark:text-white tracking-tight leading-tight">
            The Campus Placement Operating System.
          </h1>

          <p className="text-[#034D35]/80 dark:text-gray-300 text-base font-medium leading-relaxed">
            Bridging corporate hiring with student potential. Access your
            tailored dashboard to manage drives, applications, and recruitment
            workflows seamlessly.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-[#034D35] dark:text-[#B6F596]"
              />
              <span className="text-sm font-semibold text-[#034D35] dark:text-gray-200">
                Real-time campus analytics
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-[#034D35] dark:text-[#B6F596]"
              />
              <span className="text-sm font-semibold text-[#034D35] dark:text-gray-200">
                Automated eligibility validation
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-[#034D35] dark:text-[#B6F596]"
              />
              <span className="text-sm font-semibold text-[#034D35] dark:text-gray-200">
                Seamless interview scheduling
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <Logo className="w-[180px] sm:w-[200px] h-auto text-[#049669] dark:text-white transition-colors duration-300" />
          </div>

          <h2 className="text-3xl font-bold text-[#121212] dark:text-white mb-2">
            Log In
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 font-medium">
            Access your CampusBridge dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-[#121212] dark:text-gray-200 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-[#121212] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-full text-base font-bold !text-white bg-[#121212] hover:bg-black dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white dark:border-[#034D35] border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col space-y-3 sm:space-y-0 sm:flex-row items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Corporate HR?{" "}
              <Link
                to="/register-hr"
                className="text-[#121212] dark:text-white font-semibold underline underline-offset-4 hover:text-indigo-600 transition-colors"
              >
                Register here
              </Link>
            </span>
            <Link
              to="/forgot-password"
              className="text-gray-600 dark:text-gray-400 font-semibold underline underline-offset-4 hover:text-[#121212] dark:hover:text-white transition-colors"
            >
              I forgot my password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
