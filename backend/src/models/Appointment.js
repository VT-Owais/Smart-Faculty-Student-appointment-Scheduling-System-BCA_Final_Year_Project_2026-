const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  facultyId: {
    type: String,
    required: true
  },
  facultyName: {
    type: String,
    // required: true - Removed to allow legacy data updates
  },
  department: {
    type: String,
    // required: true - Removed to allow legacy data updates
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '30 mins'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const AppointmentModel = mongoose.model('Appointment', AppointmentSchema);
module.exports = AppointmentModel;