import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, LogOut, Settings } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/admin/students', icon: <Users size={20} />, label: 'Student Management' },
    { path: '/admin/students/bulk-import', icon: <Users size={20} />, label: 'Bulk Import Students' },
    { path: '/admin/hr', icon: <Briefcase size={20} />, label: 'HR Management' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] flex overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-[#112240] border-r border-gray-800 flex flex-col transition-all duration-300 z-20">
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-[#00ED64] tracking-wider">
            Campus<span className="text-white">Bridge</span>
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
                  ? 'bg-[#00ED64]/10 text-[#00ED64] font-semibold border-r-2 border-[#00ED64]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Logout */}
        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-[#112240]/80 backdrop-blur-md border-b border-gray-800 flex items-center px-8 z-10 shrink-0">
          <h1 className="text-xl font-semibold text-white capitalize">
            {location.pathname.split('/').pop().replace('-', ' ')}
          </h1>
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
