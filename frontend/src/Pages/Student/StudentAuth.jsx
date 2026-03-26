import React, { useState } from 'react';
import StudentLogin from './StudentLogin';
import StudentRegister from './StudentRegister';
import AuthTabs from '../../Pages/auth/AuthTabs';

const StudentAuth = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Hero/Info Section */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-10 lg:p-12">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-8">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v6l9-5M12 20l-9-5" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold ml-3">Student Portal</h1>
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Book Appointments<br />Effortlessly
                </h2>
                
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center">
                    <div className="bg-white/20 p-1 rounded-full mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>View faculty availability</span>
                  </li>
                  <li className="flex items-center">
                    <div className="bg-white/20 p-1 rounded-full mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Book appointments with faculty</span>
                  </li>
                  <li className="flex items-center">
                    <div className="bg-white/20 p-1 rounded-full mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Track your appointment history</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm opacity-90">
                  <strong>Note:</strong> Student registration requires valid student ID.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="p-8 lg:p-12">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Student Access
              </h3>
              <p className="text-gray-600">
                Sign in to your account or register as new student
              </p>
            </div>

            {/* Tabs */}
            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Form Content */}
            <div className="mt-8">
              {activeTab === 'login' ? <StudentLogin /> : <StudentRegister />}
            </div>

            {/* Back to Home */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <a 
                href="/" 
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default StudentAuth;