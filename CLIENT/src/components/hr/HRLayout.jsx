import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import {
  LayoutDashboard,
  Briefcase,
  LogOut,
  Settings,
  Sun,
  Moon,
  User,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import Logo from "../../pages/Logo";

const HRLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("role");
    navigate("/login");
  };

  const closeSidebar = () => {
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const navItems = [
    {
      path: "/hr/dashboard",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
    },
    {
      path: "/hr/job-drives",
      icon: <Briefcase size={18} />,
      label: "My Job Drives",
    },
    { path: "/hr/profile", icon: <User size={18} />, label: "Company Profile" },
    { path: "/hr/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-gray-100 flex overflow-hidden font-sans transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Area */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-slate-700">
          <Logo className="w-[140px] h-auto text-[#049669] dark:text-white transition-colors duration-300" />
          <button
            onClick={closeSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
                ${
                  isActive
                    ? "bg-[#B6F596]/30 text-[#034D35] dark:bg-[#034D35]/50 dark:text-[#B6F596]"
                    : "text-gray-600 dark:text-gray-400 hover:text-[#121212] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50"
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-3 px-4 py-3 w-full text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#121212] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-gray-600" />
            )}
            <span>{theme === "dark" ? "Light Theme" : "Dark Theme"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-extrabold text-[#121212] dark:text-white hidden sm:block">
              Recruiter Workspace
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-[#F9F7F1] text-[#121212] dark:bg-slate-700 dark:text-gray-200 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
              Corporate HR
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative bg-[#F9F7F1] dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRLayout;
