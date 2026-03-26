// src/Pages/faculty/FacultyAuth.jsx
import React, { useState } from 'react';
import FacultyLogin from './FacultyLogin';
import FacultyRegister from './FacultyRegister';
import AuthTabs from '../../Pages/auth/AuthTabs';

const FacultyAuth = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Hero/Info Section */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 sm:p-8 lg:p-10 xl:p-12 hidden lg:block">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-6 lg:mb-8">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l9-5M12 20l-9-5" />
                    </svg>
                  </div>
                  <h1 className="text-xl lg:text-2xl font-bold ml-3">Faculty Portal</h1>
                </div>

                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 lg:mb-6">
                  Manage Your Schedule<br />with Ease
                </h2>
                
                <ul className="space-y-3 lg:space-y-4 mb-8 lg:mb-10">
                  {['Set available time slots', 'Approve student requests', 'View appointment history'].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <div className="bg-white/20 p-1 rounded-full mr-2 lg:mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm lg:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/10 rounded-lg p-3 lg:p-4">
                <p className="text-xs lg:text-sm opacity-90">
                  <strong>Note:</strong> Faculty registration requires valid faculty ID provided by administration.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Hero Banner */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-5 sm:p-6 lg:hidden">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold">Faculty Portal</h1>
                <p className="text-sm opacity-90 mt-1">Manage appointments with ease</p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="mb-6 lg:mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1 lg:mb-2">
                Faculty Access
              </h3>
              <p className="text-sm lg:text-base text-gray-600">
                Sign in to your account or register as new faculty
              </p>
            </div>

            {/* Tabs */}
            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Form Content */}
            <div className="mt-6 lg:mt-8">
              {activeTab === 'login' ? <FacultyLogin /> : <FacultyRegister />}
            </div>

            {/* Back to Home */}
            <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-100">
              <a 
                href="/" 
                className="flex items-center text-purple-600 hover:text-purple-800 text-sm lg:text-base"
              >
                <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAuth;