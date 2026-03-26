import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../Pages/LandingPage';

// Faculty Routes
import FacultyAuth from '../pages/faculty/FacultyAuth';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';

// Student Routes
import StudentAuth from '../pages/student/StudentAuth';
import StudentDashboard from '../pages/student/StudentDashboard';

// Admin Routes
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Faculty Routes */}
      <Route path="/faculty/auth" element={<FacultyAuth />} />
      <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      
      {/* Student Routes */}
      <Route path="/student/auth" element={<StudentAuth />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;