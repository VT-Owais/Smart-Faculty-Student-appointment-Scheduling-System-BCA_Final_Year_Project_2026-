import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaChevronLeft, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';


const AppointmentRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
  fetchAppointments();
}, []);

const fetchAppointments = async () => {
  try {
    setLoading(true);
    const facultyId = localStorage.getItem('facultyId');
    const response = await axios.get(`http://localhost:8000/faculty/${facultyId}/appointments`);

    if (response.data.success) {
      setRequests(response.data.appointments);
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
  } finally {
    setLoading(false);
  }
};


  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:8000/appointments/${requestId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        // Update local state
        setRequests(prev =>
          prev.map(req =>
            req._id === requestId ? { ...req, status: newStatus } : req
          )
        );

        alert(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeFilter === 'all') return true;
    return request.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={() => navigate('/faculty/dashboard')}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-3 lg:mb-4 text-sm lg:text-base"
          >
            <FaChevronLeft className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">All Appointment Requests</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">View and manage all student slot requests</p>
        </div>

        {/* Filter Tabs - Mobile Scrollable */}
        <div className="mb-4 lg:mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {['all', 'pending', 'approved', 'rejected'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-sm lg:text-base font-medium whitespace-nowrap transition-colors ${activeFilter === filter
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                {filter === 'all' && 'All'}
                {filter === 'pending' && 'Pending'}
                {filter === 'approved' && 'Approved'}
                {filter === 'rejected' && 'Rejected'}
              </button>
            ))}
            <button className="flex items-center px-3 py-1.5 lg:px-4 lg:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm lg:text-base whitespace-nowrap transition-colors">
              <FaFilter className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Requests Table - Responsive */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.studentName}</div>
                        <div className="text-sm text-gray-600">{request.studentId}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{request.email}</div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.date}</div>
                      <div className="text-sm text-gray-600">{request.time} ({request.duration})</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate">{request.purpose}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex space-x-3">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(request.id, 'approved')}
                              className="text-green-600 hover:text-green-800 font-medium flex items-center text-sm"
                            >
                              <FaCheckCircle className="mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-800 font-medium flex items-center text-sm"
                            >
                              <FaTimesCircle className="mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm">
                          <FaEye className="mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {filteredRequests.map(request => (
              <div key={request.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{request.studentName}</div>
                    <div className="text-sm text-gray-600">{request.studentId}</div>
                    <div className="text-xs text-gray-500">{request.email}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-1">{request.date}</div>
                  <div className="text-sm text-gray-600 mb-2">{request.time} ({request.duration})</div>
                  <div className="text-sm text-gray-900">
                    <span className="font-medium">Purpose:</span> {request.purpose}
                  </div>
                </div>

                <div className="flex space-x-3">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(request.id, 'approved')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center"
                      >
                        <FaCheckCircle className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center"
                      >
                        <FaTimesCircle className="mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center">
                    <FaEye className="mr-2" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">No appointment requests match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentRequest;