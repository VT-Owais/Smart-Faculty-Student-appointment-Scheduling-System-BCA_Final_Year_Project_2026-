import React from 'react';

const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        className={`flex-1 py-3 text-center font-medium text-lg transition-colors ${
          activeTab === 'login'
            ? 'text-purple-600 border-b-2 border-purple-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onTabChange('login')}
      >
        Sign In
      </button>
      <button
        className={`flex-1 py-3 text-center font-medium text-lg transition-colors ${
          activeTab === 'register'
            ? 'text-purple-600 border-b-2 border-purple-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onTabChange('register')}
      >
        Register
      </button>
    </div>
  );
};

export default AuthTabs;