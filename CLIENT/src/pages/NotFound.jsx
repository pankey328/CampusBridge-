import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleGoBack = () => {
    if (!token || !role) {
      navigate('/login');
    } else {
      if (role === 'SUPERADMIN' || role === 'TPO') {
        navigate('/admin/dashboard');
      } else if (role === 'HR') {
        navigate('/hr/dashboard');
      } else if (role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute w-96 h-96 bg-[#00ED64] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full bg-[#112240] p-8 rounded-2xl border border-gray-800 shadow-2xl text-center space-y-6 animate-fadeIn">
        <div className="inline-flex bg-yellow-900/20 text-yellow-400 p-4 rounded-full border border-yellow-800/40 animate-bounce">
          <AlertTriangle size={48} />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-[#00ED64] tracking-tight">404</h1>
          <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <button
          onClick={handleGoBack}
          className="w-full bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#00ED64]/10 flex items-center justify-center gap-2 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
