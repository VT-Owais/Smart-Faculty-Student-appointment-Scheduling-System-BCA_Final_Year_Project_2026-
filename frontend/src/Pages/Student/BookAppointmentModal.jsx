import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendar, FaClock, FaUser, FaCheck } from 'react-icons/fa';
import axios from 'axios';

const BookAppointmentModal = ({ facultyId, onClose, onAppointmentBooked, appointmentToReschedule }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [purpose, setPurpose] = useState(appointmentToReschedule?.purpose || '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [facultyInfo, setFacultyInfo] = useState(null);

  useEffect(() => {
    if (facultyId) {
      fetchFacultySlots();
      fetchFacultyInfo();
    }
  }, [facultyId]);

  const fetchFacultySlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/faculty/${facultyId}/slots`);
      if (response.data.success) {
        // Filter only available slots
        const availableSlots = response.data.slots.filter(slot => slot.isAvailable);
        setSlots(availableSlots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setMessage({ type: 'error', text: 'Failed to load available slots' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/faculty/${facultyId}`);
      if (response.data.success) {
        setFacultyInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching faculty info:', error);
    }
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Returns the date string (YYYY-MM-DD) for the next occurrence of a given day name
  const getNextDateForDay = (dayName) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(dayName);
    if (targetDay === -1) return new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentDay = now.getDay();
    let diff = targetDay - currentDay;
    if (diff < 0) diff += 7; // if the day already passed this week, go to next week
    // if diff === 0 it means today matches — keep today
    const target = new Date(now);
    target.setDate(now.getDate() + diff);
    return target.toISOString().split('T')[0];
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setMessage({ type: 'error', text: 'Please select a time slot' });
      return;
    }

    if (!purpose.trim()) {
      setMessage({ type: 'error', text: 'Please enter appointment purpose' });
      return;
    }

    try {
      setSubmitting(true);

      if (appointmentToReschedule) {
        // Reschedule logic
        const slotDate = getNextDateForDay(selectedSlot.day);
        const response = await axios.put(`http://localhost:8000/appointments/${appointmentToReschedule._id}/reschedule`, {
          slotId: selectedSlot._id,
          date: slotDate,
          time: `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`
        });

        if (response.data.success) {
          setMessage({
            type: 'success',
            text: 'Appointment rescheduled successfully!'
          });
          if (onAppointmentBooked) onAppointmentBooked();
          setTimeout(onClose, 2000);
        }

      } else {
        // New Booking logic
        const studentId = localStorage.getItem('studentId');
        const studentName = localStorage.getItem('studentName') || 'Student';

        const slotDate = getNextDateForDay(selectedSlot.day);
        const response = await axios.post('http://localhost:8000/appointments', {
          slotId: selectedSlot._id,
          facultyId: selectedSlot.facultyId,
          facultyName: facultyInfo?.fullName || 'Faculty',
          department: facultyInfo?.department || 'Department',
          studentId,
          studentName,
          purpose,
          date: slotDate, // Next upcoming date for the slot's day
          time: `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`
        });

        if (response.data.success) {
          setMessage({
            type: 'success',
            text: 'Appointment request sent successfully!'
          });

          if (onAppointmentBooked) {
            onAppointmentBooked();
          }

          setTimeout(() => {
            onClose();
          }, 1000); // Closed faster as requested
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to process request';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {appointmentToReschedule ? 'Reschedule Appointment' : 'Book Appointment'}
            </h2>
            {facultyInfo && (
              <p className="text-gray-600">
                With {facultyInfo.fullName} • {facultyInfo.department}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.text}
            </div>
          )}

          {/* Available Slots */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCalendar className="mr-2 text-blue-600" />
              Available Time Slots
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading available slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No available slots at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-4 border rounded-lg text-left transition-all ${selectedSlot?._id === slot._id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedSlot?._id === slot._id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <FaClock />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{slot.day}</div>
                        <div className="text-sm text-gray-600">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                      </div>
                      {selectedSlot?._id === slot._id && (
                        <FaCheck className="ml-auto text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purpose Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-1" />
              Appointment Purpose
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Briefly describe what you'd like to discuss..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
            />
          </div>

          {/* Selected Slot Summary */}
          {selectedSlot && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Selected Slot</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-900">
                    <span className="font-medium">{selectedSlot.day}</span> • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </p>
                  <p className="text-sm text-blue-700">Duration: 30 minutes</p>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleBookAppointment}
              disabled={!selectedSlot || !purpose.trim() || submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                appointmentToReschedule ? 'Confirm Reschedule' : 'Confirm Appointment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;