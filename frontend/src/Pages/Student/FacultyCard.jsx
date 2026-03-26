import React from 'react';
import { FaUserTie, FaBook, FaCalendarPlus } from 'react-icons/fa';

const FacultyCard = ({ faculty, onBook }) => {
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'FC';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all transform hover:-translate-y-1 p-6">
      {/* Faculty Info */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {getInitials(faculty.fullName)}
        </div>
        <div className="ml-4">
          <h3 className="font-bold text-gray-800">{faculty.fullName}</h3>
          <p className="text-sm text-gray-600">{faculty.department}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 truncate">
          <span className="font-medium">Email:</span> {faculty.email}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">ID:</span> {faculty.facultyId}
        </p>
      </div>

      {/* Book Button */}
      <button
        onClick={onBook}
        className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
      >
        <FaCalendarPlus className="w-5 h-5 mr-2" />
        View Available Slots
      </button>
    </div>
  );
};

export default FacultyCard;