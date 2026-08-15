import React from 'react';
import ChangePassword from '../../components/common/ChangePassword';

const Settings = () => {
  return (
    <div className="max-w-3xl animate-fadeIn space-y-8">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Account Settings</h2>
        <p className="text-gray-400">Manage your password and security preferences.</p>
      </div>

      <ChangePassword />

    </div>
  );
};

export default Settings;
