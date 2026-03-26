import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaTimes, FaTrashAlt, FaUsers, FaFileDownload, FaCog, FaListAlt } from 'react-icons/fa';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    totalAppointments: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Modals state
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Manage users state
  const [manageTab, setManageTab] = useState('student');
  const [usersList, setUsersList] = useState([]);
  const [logsList, setLogsList] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const fetchData = async () => {
    try {
      const statsRes = await axios.get('http://localhost:8000/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      const actRes = await axios.get('http://localhost:8000/admin/activities?limit=4');
      if (actRes.data.success) {
        setRecentActivities(actRes.data.activities);
      }

      const apptRes = await axios.get('http://localhost:8000/admin/recent-appointments');
      if (apptRes.data.success) {
        setAppointments(apptRes.data.appointments);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time updates effect
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const openManageUsers = async () => {
    setManageTab('student');
    setIsManageUsersOpen(true);
    fetchUsers('student');
  };

  const fetchUsers = async (type) => {
    try {
      const endpoint = type === 'student' ? '/all-students' : '/all-faculty';
      const res = await axios.get(`http://localhost:8000${endpoint}`);
      if (res.data.success) {
        setUsersList(type === 'student' ? res.data.students : res.data.faculty);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const deleteUser = async (id, type) => {
    if (!window.confirm(`Are you sure you want to remove this ${type}? They will not be able to login again.`)) return;
    try {
      const endpoint = type === 'student'
        ? `http://localhost:8000/admin/users/student/${id}`
        : `http://localhost:8000/admin/users/faculty/${id}`;
      const res = await axios.delete(endpoint);
      if (res.data.success) {
        fetchUsers(type);
        fetchData(); // refresh stats
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const openLogs = async () => {
    setIsLogsOpen(true);
    try {
      const res = await axios.get('http://localhost:8000/admin/activities');
      if (res.data.success) {
        setLogsList(res.data.activities);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const generateReport = () => {
    let csv = 'Student Name,Faculty Name,Date,Time,Status\n';
    appointments.forEach(app => {
      csv += `"${app.studentName}","${app.facultyName}","${app.date}","${app.time}","${app.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Appointments_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const dashboardStats = [
    { label: 'Total Faculty', value: stats.totalFaculty, color: 'bg-blue-500' },
    { label: 'Total Students', value: stats.totalStudents, color: 'bg-green-500' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, color: 'bg-yellow-500' },
    { label: 'Total Appointments', value: stats.totalAppointments, color: 'bg-purple-500' },
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRegistrationDate = (mongoId) => {
    if (!mongoId) return 'Unknown';
    try {
      const timestamp = mongoId.toString().substring(0, 8);
      return formatDate(new Date(parseInt(timestamp, 16) * 1000));
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Header/Navbar */}
      <header className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-purple-200">System Administrator</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Settings button removed as requested */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:bg-purple-800"
              >
                <FaSignOutAlt className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome, Administrator</h2>
          <p className="text-gray-600 mt-1">Manage the entire appointment system and monitor real-time activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
              <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center mr-5 shadow-inner`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.5l-2.914-.457a1 1 0 00-1.19.447l-1.829 3.658a1 1 0 01-.894.553H6.236a1 1 0 01-.894-.553L3.53 17.053a1 1 0 00-1.19-.447L.646 17.5" />}
                  {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />}
                  {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {index === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-gray-800">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area: Quick Actions & Appointments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={openManageUsers} className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-700 hover:shadow-md transition-all group">
                  <FaUsers className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-700 group-hover:text-purple-700 text-sm">Manage Users</span>
                </button>
                <button onClick={generateReport} className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:shadow-md transition-all group">
                  <FaFileDownload className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-700 group-hover:text-blue-700 text-sm">Generate Report</span>
                </button>
                <button onClick={openLogs} className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-yellow-50 hover:text-yellow-700 hover:shadow-md transition-all group">
                  <FaListAlt className="w-8 h-8 text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-700 group-hover:text-yellow-700 text-sm">View Logs</span>
                </button>
                <button onClick={() => alert('System settings logic handled here')} className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-700 hover:shadow-md transition-all group">
                  <FaCog className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-gray-700 group-hover:text-green-700 text-sm">System Settings</span>
                </button>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Appointments</h3>
                <span className="text-sm text-gray-500">Auto-updating</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Faculty</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {appointments.length > 0 ? appointments.slice(0, 10).map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.studentName}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">Dr. {item.facultyName}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 font-mono text-xs">{item.date} {item.time}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${item.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              ['rejected', 'cancelled'].includes(item.status) ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-500">No appointments found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Recent Activity & System Status */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-5">
                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-start group">
                    <div className="bg-purple-100 p-2.5 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {activity.type === 'registration' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />}
                        {activity.type === 'appointment' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                        {activity.type === 'slot' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        {!['registration', 'appointment', 'slot'].includes(activity.type) && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{activity.action}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.user}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Database</span>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 border border-green-200"></span>Online</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">API Server</span>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 border border-green-200"></span>Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MANAGE USERS MODAL */}
      {isManageUsersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
              <button onClick={() => setIsManageUsersOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-xl self-start w-fit">
                <button
                  onClick={() => { setManageTab('student'); fetchUsers('student'); }}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${manageTab === 'student' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  Students
                </button>
                <button
                  onClick={() => { setManageTab('faculty'); fetchUsers('faculty'); }}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${manageTab === 'faculty' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  Faculty
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-4">
                {usersList.length > 0 ? usersList.map((user) => (
                  <div key={user._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex sm:items-center flex-col sm:flex-row gap-4">
                    <div className="bg-indigo-50 p-3 rounded-xl sm:flex-shrink-0 border border-indigo-100">
                      <FaUsers className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-gray-800">ID:</span> {user.studentId || user.facultyId} <span className="mx-2">|</span>
                        <span className="font-medium text-gray-800">Password:</span> <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{user.password || '******'}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Registered: {getRegistrationDate(user._id)}
                      </p>
                    </div>
                    <div className="sm:text-right text-left flex items-center justify-between sm:block">
                      <button
                        onClick={() => deleteUser(user.studentId || user.facultyId, manageTab)}
                        className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        <FaTrashAlt className="mr-2 h-4 w-4" /> Remove User
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <FaUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No {manageTab} records found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW LOGS MODAL */}
      {isLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaListAlt className="mr-3 text-purple-600" /> System Logs
              </h2>
              <button onClick={() => setIsLogsOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-4">
                {logsList.length > 0 ? logsList.map((log) => (
                  <div key={log._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex sm:items-center flex-col sm:flex-row gap-4">
                    <div className="bg-purple-50 p-3 rounded-xl sm:flex-shrink-0 border border-purple-100">
                      <FaListAlt className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600 mt-1"><span className="font-medium text-gray-800">User:</span> {log.user}</p>
                    </div>
                    <div className="sm:text-right text-left text-sm text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <FaListAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No logs available</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button onClick={() => setIsLogsOpen(false)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;