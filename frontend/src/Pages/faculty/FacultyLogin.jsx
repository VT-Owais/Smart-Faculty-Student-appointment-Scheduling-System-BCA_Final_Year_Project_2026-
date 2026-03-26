// src/Pages/faculty/FacultyLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // ← Don't forget to import axios
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const FacultyLogin = () => {
  const navigate = useNavigate();
  
  // Initialize formData state
  const [formData, setFormData] = useState({
    facultyId: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await axios.post('http://localhost:8000/facultylogin', {
      facultyId: formData.facultyId,
      password: formData.password
    });
    
    // Now checking response.data.success
    if (response.data.success) {
       localStorage.setItem('facultyId', formData.facultyId);
      navigate('/faculty/dashboard');
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
    
  } catch (err) {
    if (err.response) {
      setError(err.response.data.message || 'Invalid credentials');
    } else if (err.request) {
      setError('Network error. Please try again.');
    } else {
      setError(err.message || 'Something went wrong');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-5">
        <Input
          label="Faculty ID"
          name="facultyId"
          type="text"
          value={formData.facultyId}
          onChange={handleChange}
          placeholder="Enter your faculty ID"
          required
          icon={
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          className="text-sm sm:text-base"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          icon={
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          className="text-sm sm:text-base"
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4" />
          <span className="ml-2 text-xs sm:text-sm text-gray-600">Remember me</span>
        </label>
        <a href="/forgot-password" className="text-xs sm:text-sm text-purple-600 hover:text-purple-800">
          Forgot password?
        </a>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        fullWidth
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm sm:text-base py-2.5 sm:py-3"
      >
        Sign In
      </Button>

      {/* Demo Credentials */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-purple-800 font-medium mb-1">Demo Credentials:</p>
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          <p className="text-xs sm:text-sm text-purple-600">Faculty ID: FA001</p>
          <p className="text-xs sm:text-sm text-purple-600">Password: faculty123</p>
        </div>
      </div>
    </form>
  );
};

export default FacultyLogin;