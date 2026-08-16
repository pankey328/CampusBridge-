import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { LayoutDashboard, Users, Briefcase, LogOut, Settings, ClipboardList, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('role');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/admin/students', icon: <Users size={20} />, label: 'Student Management' },
    { path: '/admin/students/bulk-import', icon: <Users size={20} />, label: 'Bulk Import Students' },
    { path: '/admin/hr', icon: <Briefcase size={20} />, label: 'HR Management' },
    { path: '/admin/job-drives', icon: <ClipboardList size={20} />, label: 'Job Drives' },
  ];

  const role = localStorage.getItem('role');

  if (role === 'SUPERADMIN') {
    navItems.push({ path: '/admin/tpos', icon: <Shield size={20} />, label: 'TPO Management' });
  }

  navItems.push({ path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' });

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex overflow-hidden font-sans transition-colors duration-300">

      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col transition-all duration-300 z-20">
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-brand-primary)] tracking-wider">
            Campus<span className="text-[var(--color-text-primary)]">Bridge</span>
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] font-semibold border-r-2 border-[var(--color-brand-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[var(--color-border)] flex flex-col space-y-2">
          <button 
            onClick={toggleTheme}
            className="flex items-center space-x-3 px-4 py-3 w-full text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between px-8 z-10 transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Admin Portal</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage system, users and drives</p>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ED64] rounded-full mix-blend-screen filter blur-[150px] opacity-5 pointer-events-none"></div>

          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
