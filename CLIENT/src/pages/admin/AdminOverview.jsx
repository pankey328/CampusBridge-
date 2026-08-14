import React from 'react';
import { Activity } from 'lucide-react';

const AdminOverview = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fadeIn">
      <div className="bg-[#00ED64]/10 p-6 rounded-full border border-[#00ED64]/20 shadow-[0_0_30px_rgba(0,237,100,0.1)]">
        <Activity size={48} className="text-[#00ED64]" />
      </div>
      <h2 className="text-3xl font-bold text-white tracking-wide">Overview Metrics</h2>
      <p className="text-gray-400 max-w-md text-center">
        This landing page is reserved for high-level KPI charts and metrics. It will be built in a future update as requested.
      </p>
    </div>
  );
};

export default AdminOverview;
