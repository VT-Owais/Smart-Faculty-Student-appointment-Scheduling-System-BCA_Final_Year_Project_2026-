// src/Pages/faculty/ManageSlots.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPlus, FaCalendarCheck, FaTrash } from 'react-icons/fa';
import axios from 'axios'

const ManageSlots = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const facultyId = localStorage.getItem('facultyId');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    start: '',
    end: ''
  });

  // Load slots on component mount
  useEffect(() => {
    if (facultyId) {
      fetchSlots();
    }
  }, [facultyId]);


  const fetchSlots = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/faculty/${facultyId}/slots`);
      if (response.data.success) {
        setSlots(response.data.slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };


  // Update handleToggleAvailability to call backend
  const handleToggleAvailability = async (slotId, currentStatus) => {
    try {
      await axios.put(`http://localhost:8000/slots/${slotId}`, {
        isAvailable: !currentStatus
      });
      fetchSlots(); // Refresh slots
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  // Update handleDeleteSlot to call backend
  const handleDeleteSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await axios.delete(`http://localhost:8000/slots/${slotId}`);
        fetchSlots(); // Refresh slots
      } catch (error) {
        console.error('Error deleting slot:', error);
      }
    }
  };

  const handleAddSlot = async () => {
    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!newSlot.start || !newSlot.end) {
      setErrorMessage('Please enter both start and end times');
      return;
    }

    if (newSlot.start >= newSlot.end) {
      setErrorMessage('End time must be after start time');
      return;
    }

    if (newSlot.start < '09:00' || newSlot.end > '16:00') {
      setErrorMessage('Slots can only be created between 9:00 AM and 4:00 PM');
      return;
    }

    // Check for overlapping slots on same day - MOVE THIS BEFORE API CALL
    const hasOverlap = slots.some(slot =>
      slot.day === newSlot.day &&
      slot.isAvailable &&
      ((newSlot.start >= slot.startTime && newSlot.start < slot.endTime) ||
        (newSlot.end > slot.startTime && newSlot.end <= slot.endTime) ||
        (newSlot.start <= slot.startTime && newSlot.end >= slot.endTime))
    );

    if (hasOverlap) {
      setErrorMessage('This time slot overlaps with an existing slot on the same day');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/slots', {
        facultyId,
        day: newSlot.day,
        startTime: newSlot.start,
        endTime: newSlot.end,
        isAvailable: true
      });

      if (response.data.success) {
        setSuccessMessage('Time slot added successfully!');
        fetchSlots(); // Refresh slots from backend
        setNewSlot({ day: 'Monday', start: '', end: '' });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add slot');
    }
  };

  const formatTimeForDisplay = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Your Availability</h1>
          <p className="text-gray-600 text-sm sm:text-base">Set when students can book appointments with you</p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm sm:text-base">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm sm:text-base">{successMessage}</p>
          </div>
        )}

        {/* Current Availability - Wider like Part A */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Current Weekly Schedule</h2>
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <FaCalendarCheck className="mr-2 text-purple-600 text-lg" />
              <span>{slots.filter(s => s.isAvailable).length} available slots</span>
            </div>
          </div>

          {slots.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No slots configured</h3>
              <p className="text-gray-600">Add your availability below to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">

              {slots.map((slot, index) => (
                <div key={slot._id || index} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 mb-3 lg:mb-0">
                    <span className="font-semibold text-gray-900 text-base lg:text-lg">{slot.day}</span>
                    <span className="mx-4 text-gray-400 hidden lg:inline">•</span>
                    <span className="text-gray-700 text-base lg:text-lg block lg:inline mt-1 lg:mt-0">
                      {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${slot.isAvailable
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                      {slot.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      onClick={() => handleToggleAvailability(slot._id, slot.isAvailable)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                    >
                      {slot.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete slot"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Slot - Wider like Part A */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaPlus className="mr-3 text-purple-600 text-lg" />
            Add New Time Slot
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
              <select
                value={newSlot.day}
                onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                min="09:00"
                max="16:00"
                value={newSlot.start}
                onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                min="09:00"
                max="16:00"
                value={newSlot.end}
                onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Note:</span> Students can only book during available time slots.
            </p>
            <button
              onClick={handleAddSlot}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-base transition duration-200 w-full lg:w-auto flex items-center justify-center"
            >
              <FaPlus className="mr-3" />
              Add Time Slot
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageSlots;