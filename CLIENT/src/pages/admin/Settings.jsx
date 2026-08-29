import React from "react";
import ChangePassword from "../../components/common/ChangePassword";

const Settings = () => {
  return (
    <div className="max-w-3xl animate-fadeIn space-y-8 w-full pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white mb-2 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Manage your password and security preferences.
        </p>
      </div>

      <ChangePassword />
    </div>
  );
};

export default Settings;
