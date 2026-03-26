// src/Pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserShield,
  FaCalendarCheck
} from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === 'admin') {
      navigate('/admin/login');
    } else {
      navigate(`/${role}/auth`);
    }
  };

  const roleCards = [
    {
      id: 'faculty',
      title: 'Faculty',
      description: 'Manage appointments, set availability, approve requests',
      icon: <FaChalkboardTeacher />,
      gradient: 'from-blue-600 via-blue-700 to-purple-800',
      hoverGradient: 'from-blue-500 via-blue-600 to-purple-700',
      textColor: 'text-blue-100'
    },
    {
      id: 'student',
      title: 'Student',
      description: 'Book appointments, view faculty availability, track history',
      icon: <FaUserGraduate />,
      gradient: 'from-blue-600 via-blue-700 to-purple-800',
      hoverGradient: 'from-blue-500 via-blue-600 to-purple-700',
      textColor: 'text-blue-100'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage users, generate reports, system configuration',
      icon: <FaUserShield />,
      gradient: 'from-indigo-700 via-indigo-800 to-purple-900',
      hoverGradient: 'from-indigo-600 via-indigo-700 to-purple-800',
      textColor: 'text-indigo-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-950 text-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">

        {/* Header - Top Middle */}
        <div className="text-center mb-8 sm:mb-12 max-w-4xl px-4">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl">
              <FaCalendarCheck className="text-3xl sm:text-4xl" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Smart Faculty-Student scheduling Appointment System
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Streamline appointment scheduling between faculty and students
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl w-full mb-8 sm:mb-12 px-4">
          {roleCards.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl sm:rounded-2xl"
            >
              <div className={`h-full rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-sm bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 
                hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-purple-900/30`}>

                {/* Card Content */}
                <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br ${role.gradient} group-hover:${role.hoverGradient} transition-all duration-300`}>
                    <div className="text-3xl sm:text-4xl">
                      {role.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${role.textColor}`}>
                    {role.title} Login
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-8">
                    {role.description}
                  </p>

                  {/* Action Indicator */}
                  <div className="flex items-center text-xs sm:text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                    Click to continue
                    <svg className="ml-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Instructions - Bottom Middle */}
        <div className="text-center max-w-2xl px-4">
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
            Select your role to continue. New users can register, existing users can login.
          </p>

          <div className="bg-purple-900/30 border border-purple-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-purple-200">
              <span className="font-semibold">Note:</span> Faculty registration requires valid faculty ID provided by administration.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-6 sm:pt-8 border-t border-gray-800/50 w-full">
            <p className="text-xs sm:text-sm text-gray-500">
              © 2025 Smart Appointment System | BCA Final Year Project
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;