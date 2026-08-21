import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { LayoutDashboard, Briefcase, LogOut, Settings, Sun, Moon, User } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const HRLayout = () => {
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
    { path: '/hr/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/hr/job-drives', icon: <Briefcase size={20} />, label: 'My Job Drives' },
    { path: '/hr/profile', icon: <User size={20} />, label: 'My Profile' },
    { path: '/hr/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col transition-all duration-300 z-20">
        <div className="h-20 flex items-center justify-center border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-brand-primary)] tracking-wider">
            Campus<span className="text-[var(--color-text-primary)]">Bridge</span>
          </h2>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                location.pathname.startsWith(item.path)
                  ? 'bg-[var(--color-brand-primary)] text-[#001E2B] font-bold shadow-lg shadow-[var(--color-brand-primary)]/20'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <div className={`${location.pathname.startsWith(item.path) ? 'text-[#001E2B]' : 'group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)] space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)] transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-[var(--color-brand-primary)]/5 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none z-0"></div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 relative z-10 scrollbar-hide flex flex-col">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default HRLayout;
