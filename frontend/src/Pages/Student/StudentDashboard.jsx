import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import {
  FaCalendarAlt,
  FaUserTie,
  FaHistory,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaRedo,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import AppointmentCard from "../../Pages/Student/AppointmentCard";
import FacultyCard from "../../Pages/Student/FacultyCard";
import StatsCard from "../../Pages/Student/StatsCard";
import BookAppointmentModal from './BookAppointmentModal';

// Mock data for development
const mockAppointments = [
  {
    id: 1,
    facultyName: 'Dr. Sharma',
    department: 'Computer Science',
    date: 'Today, 15 Jan 2024',
    time: '10:30 AM - 11:00 AM',
    reason: 'Project Discussion',
    status: 'approved',
    statusColor: 'bg-green-100 text-green-800'
  },
  {
    id: 2,
    facultyName: 'Prof. Gupta',
    department: 'Mathematics',
    date: 'Tomorrow, 16 Jan 2024',
    time: '2:00 PM - 2:30 PM',
    reason: 'Assignment Help',
    status: 'pending',
    statusColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 3,
    facultyName: 'Dr. Patel',
    department: 'Physics',
    date: '18 Jan 2024',
    time: '11:00 AM - 11:30 AM',
    reason: 'Exam Doubts',
    status: 'approved',
    statusColor: 'bg-green-100 text-green-800'
  }
];

const mockFaculty = [
  {
    id: 1,
    name: 'Dr. Deeksha',
    department: 'MAD',
    availableSlots: 5,
    specialization: 'AI & Machine Learning'
  },
  {
    id: 2,
    name: 'Prof. Nasrulla',
    department: 'Mathematics',
    availableSlots: 3,
    specialization: 'Calculus & Algebra'
  },
  {
    id: 3,
    name: 'Dr.Kavita',
    department: 'Physics',
    availableSlots: 7,
    specialization: 'Quantum Mechanics'
  },
  {
    id: 4,
    name: 'Prof.Jeelan',
    department: 'Chemistry',
    availableSlots: 2,
    specialization: 'Organic Chemistry'
  }
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [studentName, setStudentName] = useState("Student");
  const [facultyList, setFacultyList] = useState([]);
  const [studentData, setStudentData] = useState({});
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [appointments, setAppointments] = useState([]); // Add this
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get studentId from localStorage (set during login)
        const studentId = localStorage.getItem('studentId');

        if (!studentId) {
          // If no studentId, redirect to login
          navigate('/student/auth');
          return;
        }

        // Fetch student details from backend
        const response = await axios.get(`http://localhost:8000/student/${studentId}`);

        if (response.data.success) {
          setStudentName(response.data.fullName);
          setStudentData({
            fullName: response.data.fullName,
            email: response.data.email,
            department: response.data.department,
            semester: response.data.semester
          });
          fetchAppointments(studentId);
        } else {
          setStudentName("Student");
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setStudentName("Student");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  // Fetch appointments function
  const fetchAppointments = async (studentId) => {
    try {
      setAppointmentsLoading(true);
      const response = await axios.get(`http://localhost:8000/student/${studentId}/appointments`);
      if (response.data.success) {
        setAppointments(response.data.appointments);
        updateStats(response.data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Calculate stats from appointments
  const updateStats = (appointments) => {
    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      approved: appointments.filter(a => a.status === 'approved').length,
      rejected: appointments.filter(a => a.status === 'rejected').length
    };
    setStats(stats);
  };

  useEffect(() => {
    const fetchFaculty = async () => {
      if (activeTab === 'faculty') {
        setFacultyLoading(true);
        try {
          // We need to create a backend endpoint to get all faculty
          const response = await axios.get('http://localhost:8000/all-faculty');
          if (response.data.success) {
            setFacultyList(response.data.faculty);
          }
        } catch (error) {
          console.error('Error fetching faculty:', error);
        } finally {
          setFacultyLoading(false);
        }
      }
    };

    fetchFaculty();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    navigate('/student/auth');
  };

  const handleBookAppointment = (facultyId) => {
    setSelectedFaculty(facultyId);
    setShowBookingModal(true);
  };

  const handleAppointmentBooked = () => {
    const studentId = localStorage.getItem('studentId');
    if (studentId) {
      fetchAppointments(studentId);
    }
  };

  const handleReschedule = (appointment) => {
    // Ensure we have a valid faculty ID to fetch slots
    const fId = appointment.facultyId?._id || appointment.facultyId; // Handle populated or raw ID
    if (fId) {
      setSelectedFaculty(fId);
      setAppointmentToReschedule(appointment);
      setShowBookingModal(true);
    } else {
      console.error("Missing faculty ID for reschedule");
      alert("Cannot reschedule: missing faculty information.");
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const response = await axios.put(`http://localhost:8000/appointments/${appointmentId}/cancel`);
      if (response.data.success) {
        // Refresh list
        const studentId = localStorage.getItem('studentId');
        if (studentId) fetchAppointments(studentId);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const statsCards = [
    { title: 'Total Appointments', value: stats.total.toString(), icon: <FaCalendarAlt />, color: 'bg-blue-500' },
    { title: 'Pending', value: stats.pending.toString(), icon: <FaBell />, color: 'bg-yellow-500' },
    { title: 'Approved', value: stats.approved.toString(), icon: <FaUserTie />, color: 'bg-green-500' },
    { title: 'Rejected', value: stats.rejected.toString(), icon: <FaHistory />, color: 'bg-red-500' },
  ];

  const handleRefresh = () => {
    const studentId = localStorage.getItem('studentId');
    if (studentId) {
      fetchAppointments(studentId);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <FaCalendarAlt className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {studentName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm sm:text-base font-medium rounded-lg transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              >
                <FaSignOutAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Hey, {studentName}</h2>
              <p className="text-gray-600">Manage your appointments and schedule meetings</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`pb-4 px-1 font-medium text-lg border-b-2 transition-colors ${activeTab === 'appointments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('appointments')}
            >
              <FaCalendarAlt className="inline mr-2" />
              My Appointments
            </button>
            <button
              className={`pb-4 px-1 font-medium text-lg border-b-2 transition-colors ${activeTab === 'faculty'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('faculty')}
            >
              <FaUserTie className="inline mr-2" />
              Browse Faculty
            </button>
            <button
              className={`pb-4 px-1 font-medium text-lg border-b-2 transition-colors ${activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory className="inline mr-2" />
              History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'appointments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">My Appointments</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Refresh appointments"
                  >
                    <FaRedo className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              {appointmentsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading appointments...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Pending */}
                  <div>
                    <h4 className="flex items-center text-lg font-medium text-gray-700 mb-4 pb-2 border-b">
                      <FaClock className="text-yellow-500 mr-2" />
                      Pending Requests
                      <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {appointments.filter(a => a.status === 'pending').length}
                      </span>
                    </h4>

                    <div className="space-y-4">
                      {appointments.filter(a => a.status === 'pending').length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500">No pending requests</p>
                        </div>
                      ) : (
                        appointments
                          .filter(a => a.status === 'pending')
                          .map((appointment) => (
                            <AppointmentCard
                              key={appointment._id}
                              appointment={appointment}
                              onCancel={() => handleCancel(appointment._id)}
                              onReschedule={() => handleReschedule(appointment)}
                            />
                          ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Approved */}
                  <div>
                    <h4 className="flex items-center text-lg font-medium text-gray-700 mb-4 pb-2 border-b">
                      <FaCheckCircle className="text-green-500 mr-2" />
                      Approved Appointments
                      <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {appointments.filter(a => a.status === 'approved').length}
                      </span>
                    </h4>

                    <div className="space-y-4">
                      {appointments.filter(a => a.status === 'approved').length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500">No approved appointments</p>
                        </div>
                      ) : (
                        appointments
                          .filter(a => a.status === 'approved')
                          .map((appointment) => (
                            <AppointmentCard
                              key={appointment._id}
                              appointment={appointment}
                              onCancel={() => handleCancel(appointment._id)}
                              onReschedule={() => handleReschedule(appointment)}
                            />
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faculty' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Available Faculty</h3>
                <div className="relative w-64">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search faculty by name or department..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {facultyLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading faculty...</p>
                </div>
              ) : facultyList.length === 0 ? (
                <div className="text-center py-12">
                  <FaUserTie className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No faculty available</h3>
                  <p className="text-gray-600">Check back later for available faculty members.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {facultyList.map((faculty) => (
                    <FacultyCard
                      key={faculty._id || faculty.facultyId}
                      faculty={faculty}
                      onBook={() => handleBookAppointment(faculty.facultyId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Appointment History</h3>
              {appointments.filter(a => ['approved', 'completed', 'cancelled', 'rejected'].includes(a.status)).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow">
                  <FaHistory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No history yet</h4>
                  <p className="text-gray-500">Completed, cancelled, and rejected appointments will appear here.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date &amp; Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments
                        .filter(a => ['approved', 'completed', 'cancelled', 'rejected'].includes(a.status))
                        .map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{appointment.facultyName}</div>
                              <div className="text-sm text-gray-500">{appointment.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{appointment.date}</div>
                              <div className="text-sm text-gray-500">{appointment.time}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{appointment.reason || appointment.purpose}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${(appointment.status === 'completed' || appointment.status === 'approved') ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    appointment.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                                      'bg-blue-100 text-blue-700'
                                }`}>
                                {appointment.status === 'approved' ? 'Accepted' :
                                  appointment.status === 'completed' ? 'Completed' :
                                    appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#" className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 font-medium mb-1">How to book appointments?</div>
              <p className="text-sm text-gray-600">Step-by-step guide for booking</p>
            </a>
            <a href="#" className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 font-medium mb-1">Faculty availability</div>
              <p className="text-sm text-gray-600">Check faculty schedules and slots</p>
            </a>
            <a href="#" className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 font-medium mb-1">Contact Support</div>
              <p className="text-sm text-gray-600">Get help with technical issues</p>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 Smart Appointment System • Student Portal
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Help</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showBookingModal && (
        <BookAppointmentModal
          facultyId={selectedFaculty}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedFaculty(null);
            setAppointmentToReschedule(null);
          }}
          onAppointmentBooked={handleAppointmentBooked}
          appointmentToReschedule={appointmentToReschedule}
        />
      )}

    </div>
  );
};

export default StudentDashboard;