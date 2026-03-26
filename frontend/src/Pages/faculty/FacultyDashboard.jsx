// src/Pages/faculty/FacultyDashboard.jsx - FIXED DROPDOWN
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaUserGraduate,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSignOutAlt,
  FaFilter,
  FaSearch,
  FaUsers,
  FaBars,
  FaChevronDown,
  FaCalendarCheck,
  FaRedo
} from 'react-icons/fa';
import ManageSlots from './ManageSlots';
import AppointmentRequest from './AppointmentRequest';


const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [facultyName, setFacultyName] = useState("Faculty");
  const [loading, setLoading] = useState(true);
  const [facultyData, setFacultyData] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    totalStudents: 0,
    todaySlots: 0
  });

  const handleRefresh = () => {
    const facultyId = localStorage.getItem('facultyId');
    if (facultyId) {
      fetchFacultyAppointments();
    }
  };

  useEffect(() => {
    if (facultyData.fullName) {
      fetchFacultyAppointments();
    }
  }, [facultyData]);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        // Get facultyId from localStorage (set during login)
        const facultyId = localStorage.getItem('facultyId');

        if (!facultyId) {
          // If no facultyId, redirect to login
          navigate('/faculty/auth');
          return;
        }

        // Fetch faculty details from backend
        const response = await axios.get(`http://localhost:8000/faculty/${facultyId}`);

        if (response.data.success) {
          setFacultyName(response.data.fullName);
          setFacultyData({
            fullName: response.data.fullName,
            email: response.data.email,
            department: response.data.department,
            blockedStudents: response.data.blockedStudents || []
          });
          fetchFacultyAppointments(facultyId);
        } else {
          setFacultyName("Faculty");
        }
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        setFacultyName("Faculty");
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [navigate]);


  const fetchFacultyAppointments = async () => {
    try {
      const facultyId = localStorage.getItem('facultyId');
      const pendingResponse = await axios.get(`http://localhost:8000/faculty/${facultyId}/appointments?status=pending`);

      if (pendingResponse.data.success) {
        setPendingRequests(pendingResponse.data.appointments);

        // Fetch all appointments for stats
        const allResponse = await axios.get(`http://localhost:8000/faculty/${facultyId}/appointments`);
        if (allResponse.data.success) {
          const allAppointments = allResponse.data.appointments;

          // Calculate stats
          const pendingCount = pendingResponse.data.appointments.length;
          const approvedCount = allAppointments.filter(a => a.status === 'approved').length;

          // For total students - get all students from system
          let totalStudentsCount = 0;
          try {
            const studentsResp = await axios.get('http://localhost:8000/all-students');
            if (studentsResp.data.success) {
              totalStudentsCount = studentsResp.data.count;
            }
          } catch (err) {
            console.error('Error fetching total students:', err);
          }

          // For today's slots - filter appointments for today
          const today = new Date().toISOString().split('T')[0];
          const todayAppointments = allAppointments.filter(a => a.date === today && a.status === 'approved');
          setUpcomingSlots(todayAppointments);

          setStats({
            pending: pendingCount,
            approved: approvedCount,
            totalStudents: totalStudentsCount,
            todaySlots: todayAppointments.length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('facultyId');
    localStorage.removeItem('facultyName');
    navigate('/faculty/auth');
  };


  const handleQuickAction = (action) => {
    if (action === 'setAvailability') {
      setActiveTab('slots');
    } else if (action === 'viewStudents') {
      setActiveTab('students');
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      const response = await axios.put(`http://localhost:8000/appointments/${appointmentId}/status`, {
        status: 'approved'
      });

      if (response.data.success) {
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(req => req._id !== appointmentId));
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          approved: prev.approved + 1
        }));
        alert('Appointment approved! Student has been notified.');

        // Refresh stats
        fetchFacultyAppointments();
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert('Failed to approve appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    try {
      const response = await axios.put(`http://localhost:8000/appointments/${appointmentId}/status`, {
        status: 'rejected'
      });

      if (response.data.success) {
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(req => req._id !== appointmentId));
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1
        }));
        alert('Appointment rejected! Student has been notified.');

        // Refresh stats
        fetchFacultyAppointments();
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('Failed to reject appointment');
    }
  };

  const handleBlockUnblock = async (studentId, isBlocked) => {
    try {
      const facultyId = localStorage.getItem('facultyId');
      const response = await axios.put(`http://localhost:8000/faculty/${facultyId}/block-student`, {
        studentId,
        block: !isBlocked
      });

      if (response.data.success) {
        setFacultyData(prev => ({ ...prev, blockedStudents: response.data.blockedStudents }));
      }
    } catch (error) {
      console.error('Error toggling block status:', error);
      alert('Failed to update student block status');
    }
  };

  // Fetch students for My Students tab
  useEffect(() => {
    if (activeTab === 'students') {
      const fetchStudents = async () => {
        try {
          const response = await axios.get('http://localhost:8000/all-students');
          if (response.data.success) {
            setStudentsList(response.data.students);
          }
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      };
      fetchStudents();
    } else if (activeTab === 'history') {
      const fetchHistory = async () => {
        try {
          const facultyId = localStorage.getItem('facultyId');
          const response = await axios.get(`http://localhost:8000/faculty/${facultyId}/appointments`);
          if (response.data.success) {
            // Filter for history — include approved so accepted ones show up
            const history = response.data.appointments.filter(a =>
              ['approved', 'completed', 'cancelled', 'rejected'].includes(a.status)
            );
            setHistoryList(history);
          }
        } catch (error) {
          console.error('Error fetching history:', error);
        }
      };
      fetchHistory();
    }
  }, [activeTab]);

  const [studentsList, setStudentsList] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Update the stats array to use real data
  const statsArray = [
    { title: 'Pending Requests', value: stats.pending.toString(), icon: <FaClock />, color: 'bg-yellow-500' },
    { title: 'Approved Slots', value: stats.approved.toString(), icon: <FaCheckCircle />, color: 'bg-green-500' },
    { title: 'Total Students', value: stats.totalStudents.toString(), icon: <FaUsers />, color: 'bg-blue-500' },
    { title: 'Today\'s Slots', value: stats.todaySlots.toString(), icon: <FaCalendarAlt />, color: 'bg-purple-500' },
  ];
  const tabs = ['dashboard', 'slots', 'students', 'history'];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header - Responsive */}
      <header className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 mr-2 text-white hover:bg-white/10 rounded-lg"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <div className="bg-white/20 p-2 rounded-lg hidden sm:block">
                <FaUserGraduate className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="ml-2 sm:ml-3">
                <h1 className="text-lg sm:text-xl font-bold truncate">Faculty Dashboard</h1>
                <p className="text-xs sm:text-sm text-purple-200 truncate">Welcome, {facultyName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-purple-800 text-sm sm:text-base font-medium rounded-lg hover:bg-gray-100 flex items-center"
              >
                <FaSignOutAlt className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>

          <div className="lg:hidden py-3">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full bg-gray-900 text-white border border-purple-500 rounded-lg px-4 py-2.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium"
                style={{
                  // Force browser to use proper dropdown styling
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  // Ensure dropdown options have dark background
                  backgroundColor: '#1f2937',
                  color: 'white'
                }}
              >

                {tabs.map((tab) => (
                  <option key={tab} value={tab} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                    {tab === 'dashboard' && 'Dashboard'}
                    {tab === 'slots' && 'Manage Slots'}
                    {tab === 'students' && 'My Students'}
                    {tab === 'history' && 'History'}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-6">
        {/* Desktop Tabs Navigation - Hidden on mobile */}
        <div className="hidden lg:block mb-6 border-b border-gray-200">
          <div className="flex space-x-6 lg:space-x-8">
            {['dashboard', 'slots', 'students', 'history'].map((tab) => (
              <button
                key={tab}
                className={`pb-4 px-1 font-medium text-base lg:text-lg border-b-2 transition-colors ${activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'dashboard' && 'Dashboard'}
                {tab === 'slots' && 'Manage Slots'}
                {tab === 'students' && 'My Students'}
                {tab === 'history' && 'History'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
                {statsArray.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center">
                      <div className={`${stat.color} w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mr-2 sm:mr-3 lg:mr-4 flex-shrink-0`}>
                        <div className="text-white text-sm sm:text-base lg:text-xl">{stat.icon}</div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">{stat.value}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{stat.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Two Column Layout - Stack on mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Pending Requests */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                        Pending Requests
                        {pendingRequests.length > 0 && (
                          <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full">
                            {pendingRequests.length} new
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleRefresh}
                          className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
                        >
                          <FaRedo className="mr-1" />
                          Refresh
                        </button>
                        <button className="text-sm text-purple-600 hover:text-purple-800 self-start sm:self-center flex items-center">
                          <FaFilter className="inline mr-1" />
                          Filter
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                          <FaCheckCircle className="text-green-600 w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">All clear!</h3>
                        <p className="text-sm text-gray-600">No pending requests at the moment.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {pendingRequests.map(request => (
                          <div key={request._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                              <div className="max-w-[70%]">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{request.studentName}</h4>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">ID: {request.studentId}</p>
                              </div>
                              <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
                                Pending
                              </span>
                            </div>

                            <div className="mb-3 sm:mb-4 space-y-1">
                              <p className="text-xs sm:text-sm"><span className="font-medium">Date:</span> {request.date}</p>
                              <p className="text-xs sm:text-sm"><span className="font-medium">Time:</span> {request.time}</p>
                              <p className="text-xs sm:text-sm mt-1 sm:mt-2"><span className="font-medium">Purpose:</span> {request.purpose}</p>
                            </div>

                            <div className="flex space-x-2 sm:space-x-3">
                              <button
                                onClick={() => handleApprove(request._id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-1.5 sm:py-2 rounded-lg font-medium transition flex items-center justify-center"
                              >
                                <FaCheckCircle className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request._id)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-1.5 sm:py-2 rounded-lg font-medium transition flex items-center justify-center"
                              >
                                <FaTimesCircle className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Stack vertically */}
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {/* Upcoming Slots */}
                  <div className="bg-white rounded-lg sm:rounded-xl shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                        <FaCalendarCheck className="mr-2 text-purple-600" />
                        Today's Schedule
                      </h2>
                    </div>
                    <div className="p-4 sm:p-6">
                      {upcomingSlots.length === 0 ? (
                        <div className="text-center py-6 sm:py-8">
                          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <FaCalendarAlt className="text-gray-400 w-6 h-6 sm:w-8 sm:h-8" />
                          </div>
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No slots today</h3>
                          <p className="text-sm text-gray-600">Enjoy your free time!</p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {upcomingSlots.map(slot => (
                            <div key={slot._id} className="border-l-4 border-green-500 pl-3 sm:pl-4 py-2 sm:py-3">
                              <div className="flex justify-between items-start">
                                <div className="max-w-[70%]">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{slot.studentName}</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 truncate">ID: {slot.studentId}</p>
                                  <p className="text-xs sm:text-sm mt-1 sm:mt-2"><span className="font-medium">Time:</span> {slot.time}</p>
                                  <p className="text-xs sm:text-sm truncate"><span className="font-medium">Purpose:</span> {slot.purpose}</p>
                                </div>
                                <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap">
                                  Confirmed
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Quick Actions</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        onClick={() => handleQuickAction('setAvailability')}
                        className="w-full text-left p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition hover:shadow-sm border border-purple-100"
                      >
                        <div className="font-medium text-purple-700 text-sm sm:text-base mb-1">Set Weekly Availability</div>
                        <p className="text-xs sm:text-sm text-gray-600">Define your available time slots</p>
                      </button>
                      <button
                        onClick={() => handleQuickAction('viewStudents')}
                        className="w-full text-left p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition hover:shadow-sm border border-blue-100"
                      >
                        <div className="font-medium text-blue-700 text-sm sm:text-base mb-1">View All Students</div>
                        <p className="text-xs sm:text-sm text-gray-600">See your student list</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Manage Slots Tab */}
          {activeTab === 'slots' && (
            <div>
              <ManageSlots />
            </div>
          )}

          {/* My Students Tab */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">All Registered Students</h2>

                </div>
              </div>

              <div className="p-4 sm:p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Student ID</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                      <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentsList.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4 text-gray-500">No students registered yet</td></tr>
                    ) : (
                      studentsList.map((student, index) => {
                        const isBlocked = facultyData.blockedStudents?.includes(student.studentId);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                              <div className="text-xs text-gray-600 sm:hidden">ID: {student.studentId}</div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                              {student.studentId}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                              <span className="truncate max-w-[150px] block">{student.email}</span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                              {student.department}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                              <button
                                onClick={() => handleBlockUnblock(student.studentId, isBlocked)}
                                className={`px-3 py-1.5 font-medium text-xs rounded-md transition-colors w-full ${isBlocked
                                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                                  }`}
                              >
                                {isBlocked ? 'Unblock' : 'Block'}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Appointment History</h2>
              </div>

              <div className="p-4 sm:p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date & Time</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {historyList.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4 text-gray-500">No history found</td></tr>
                    ) : (
                      historyList.map((appointment, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{appointment.studentName}</div>
                            <div className="text-xs text-gray-600 sm:hidden">{appointment.date}</div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                            {appointment.date} at {appointment.time}
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <span className="text-sm text-gray-900 truncate max-w-[150px] block">{appointment.purpose}</span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${(appointment.status === 'completed' || appointment.status === 'approved') ? 'bg-green-100 text-green-800' :
                                appointment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  appointment.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                                    'bg-blue-100 text-blue-700'
                              }`}>
                              {appointment.status === 'approved' ? 'Accepted' :
                                appointment.status === 'completed' ? 'Completed' :
                                  appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                            -
                          </td>
                        </tr>
                      )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home Button */}
        <div className="mt-6 lg:mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;