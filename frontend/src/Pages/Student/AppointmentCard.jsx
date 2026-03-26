import React from 'react';
import { FaCalendar, FaClock, FaUserTie, FaTag, FaTimes, FaEdit } from 'react-icons/fa';

const AppointmentCard = ({ appointment, onCancel, onReschedule }) => {
  // Get status color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <FaUserTie className="text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">
              {appointment.facultyName || appointment.facultyId?.fullName || 'Faculty Member'}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Appointment ID: {appointment._id?.substring(0, 8) || appointment.id}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {appointment.department || appointment.facultyId?.department || 'Department not specified'}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
          {formatStatus(appointment.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center">
          <FaCalendar className="text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-700">Date</p>
            <p className="text-sm text-gray-900">{appointment.date || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FaClock className="text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-700">Time</p>
            <p className="text-sm text-gray-900">{appointment.time || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center">
          <FaTag className="text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-700">Purpose</p>
            <p className="text-sm text-gray-900">{appointment.purpose || 'No purpose specified'}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        {appointment.status === 'pending' && (
          <>
            <button
              onClick={onReschedule}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center"
            >
              <FaEdit className="mr-2" />
              Reschedule
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </>
        )}
        {appointment.status === 'approved' && (
          <button
            onClick={() => alert('Join meeting functionality would go here')}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
          >
            Join Meeting
          </button>
        )}
      </div>

      {appointment.status === 'pending' && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Waiting for faculty approval
        </p>
      )}
    </div>
  );
};

export default AppointmentCard;