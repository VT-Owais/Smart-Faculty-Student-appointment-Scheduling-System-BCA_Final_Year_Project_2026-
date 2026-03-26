const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const FacultyModel = require('./src/models/Faculty');
const SlotModel = require('./src/models/Slot');
const AppointmentModel = require('./src/models/Appointment');
const ActivityModel = require('./src/models/Activity');

const StudentModel = require('./src/models/student');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/Register");

//Faculty Login
app.post('/facultylogin', (req, res) => {
  const { facultyId, password } = req.body;

  FacultyModel.findOne({ facultyId: facultyId })
    .then(user => {
      if (user) {
        if (user.password == password) {
          res.json({ success: true, message: 'Login successful', facultyId: user.facultyId, fullName: user.fullName });
        } else {
          res.json({ success: false, message: 'Incorrect password' });
        }
      } else {
        res.json({ success: false, message: 'No user found with this Faculty ID' });
      }
    })
    .catch(err => {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

// Faculty Registration
app.post('/facultyregister', (req, res) => {
  FacultyModel.create(req.body)
    .then(Faculty => {
      ActivityModel.create({
        action: 'New faculty registered',
        user: Faculty.fullName,
        type: 'registration'
      });
      res.json(Faculty);
    })
    .catch(err => res.json(err));
});

// Faculty fetch Name

app.get('/faculty/:id', (req, res) => {
  const facultyId = req.params.id;

  FacultyModel.findOne({ facultyId: facultyId })
    .then(faculty => {
      if (faculty) {
        res.json({
          success: true,
          fullName: faculty.fullName,
          email: faculty.email,
          department: faculty.department,
          blockedStudents: faculty.blockedStudents || []
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }
    })
    .catch(err => {
      console.error('Get faculty error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    });
});

// Get all slots for a faculty
app.get('/faculty/:id/slots', (req, res) => {
  const facultyId = req.params.id;

  SlotModel.find({ facultyId: facultyId })
    .then(slots => res.json({ success: true, slots }))
    .catch(err => {
      console.error('Get slots error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

// Create new slot
app.post('/slots', (req, res) => {
  const { facultyId, day, startTime, endTime, isAvailable } = req.body;

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return res.status(400).json({ success: false, message: 'Invalid time format' });
  }

  // Validate time is between 9:00 AM and 4:00 PM (09:00 to 16:00)
  const startHour = parseInt(startTime.split(':')[0], 10);
  const startMinute = parseInt(startTime.split(':')[1], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);
  const endMinute = parseInt(endTime.split(':')[1], 10);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // 9:00 AM is 9 * 60 = 540 minutes
  // 4:00 PM is 16 * 60 = 960 minutes
  if (startMinutes < 540 || endMinutes > 960 || startMinutes >= endMinutes) {
    return res.status(400).json({ success: false, message: 'Slots can only be created between 9:00 AM and 4:00 PM, and start time must be before end time' });
  }

  // Check if slot already exists
  SlotModel.findOne({
    facultyId,
    day,
    startTime,
    endTime
  })
    .then(existingSlot => {
      if (existingSlot) {
        return res.status(400).json({
          success: false,
          message: 'Slot already exists'
        });
      }

      // Create new slot
      SlotModel.create({
        facultyId,
        day,
        startTime,
        endTime,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      })
        .then(slot => {
          FacultyModel.findOne({ facultyId: facultyId }).then(fac => {
            if (fac) {
              ActivityModel.create({
                action: 'Slot created',
                user: `Prof. ${fac.fullName}`,
                type: 'slot'
              });
            }
          });
          res.json({ success: true, slot });
        })
        .catch(err => {
          console.error('Create slot error:', err);
          res.status(500).json({ success: false, message: 'Server error' });
        });
    })
    .catch(err => {
      console.error('Check slot error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

// Update slot (toggle availability)
app.put('/slots/:id', (req, res) => {
  const slotId = req.params.id;
  const { isAvailable } = req.body;

  SlotModel.findByIdAndUpdate(
    slotId,
    { isAvailable },
    { new: true }
  )
    .then(slot => {
      if (!slot) {
        return res.status(404).json({ success: false, message: 'Slot not found' });
      }
      res.json({ success: true, slot });
    })
    .catch(err => {
      console.error('Update slot error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

// Delete slot
app.delete('/slots/:id', (req, res) => {
  const slotId = req.params.id;

  SlotModel.findByIdAndDelete(slotId)
    .then(slot => {
      if (!slot) {
        return res.status(404).json({ success: false, message: 'Slot not found' });
      }
      res.json({ success: true, message: 'Slot deleted' });
    })
    .catch(err => {
      console.error('Delete slot error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

// Block/Unblock student
app.put('/faculty/:id/block-student', async (req, res) => {
  const facultyId = req.params.id;
  const { studentId, block } = req.body;

  try {
    const faculty = await FacultyModel.findOne({ facultyId: facultyId });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    if (!faculty.blockedStudents) {
      faculty.blockedStudents = [];
    }

    const strStudentId = String(studentId);

    if (block) {
      if (!faculty.blockedStudents.includes(strStudentId)) {
        faculty.blockedStudents.push(strStudentId);
      }

      // Reject any pending appointments from this blocked student for this faculty
      await AppointmentModel.updateMany({
        facultyId: facultyId,
        studentId: studentId,
        status: 'pending'
      }, {
        status: 'rejected',
        updatedAt: Date.now()
      });
    } else {
      faculty.blockedStudents = faculty.blockedStudents.filter(id => id !== strStudentId);
      faculty.markModified('blockedStudents');
    }

    await faculty.save();
    res.json({ success: true, blockedStudents: faculty.blockedStudents });
  } catch (err) {
    console.error('Block student error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// APPOINTMENT MANAGEMENT ROUTES
// Get all appointments for a faculty
app.get('/faculty/:id/appointments', async (req, res) => {
  const facultyId = req.params.id;
  const { status } = req.query; // Optional filter by status

  let query = { facultyId };
  if (status && status !== 'all') {
    query.status = status;
  }

  try {
    let appointments = await AppointmentModel.find(query).sort({ date: 1, time: 1 });

    // Update statuses based on time
    appointments = await updateAppointmentStatuses(appointments);

    res.json({ success: true, appointments });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create appointment request (student books slot)
app.post('/appointments', async (req, res) => {
  const { slotId, facultyId, facultyName, department, studentId, studentName, purpose, date, time } = req.body;

  try {
    // Check if faculty blocked the student
    const faculty = await FacultyModel.findOne({ facultyId: facultyId });
    if (faculty && faculty.blockedStudents && faculty.blockedStudents.includes(String(studentId))) {
      return res.status(403).json({ success: false, message: `You are blocked from booking appointments with ${facultyName}.` });
    }

    // Check if slot exists
    const slot = await SlotModel.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    // Check if slot is available
    if (!slot.isAvailable) {
      return res.status(400).json({ success: false, message: 'Slot is not available' });
    }

    // Check if student already has pending/approved appointment at same time
    const existingAppointment = await AppointmentModel.findOne({
      studentId,
      date,
      time,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment at this time'
      });
    }

    // Create appointment
    const appointment = await AppointmentModel.create({
      slotId,
      facultyId,
      facultyName,
      department,
      studentId,
      studentName,
      purpose,
      date,
      time,
      status: 'pending'
    });

    await ActivityModel.create({
      action: 'Appointment booked',
      user: `Student: ${studentName}`,
      type: 'appointment'
    });

    res.json({ success: true, appointment });

  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update appointment status (approve/reject)
app.put('/appointments/:id/status', async (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update the specific appointment
    appointment.status = status;
    appointment.updatedAt = Date.now();
    await appointment.save();

    if (status === 'approved') {
      // If approved, mark slot as unavailable
      await SlotModel.findByIdAndUpdate(appointment.slotId, { isAvailable: false });

      // Reject all other pending appointments for this slot
      await AppointmentModel.updateMany(
        {
          slotId: appointment.slotId,
          _id: { $ne: appointmentId },
          status: 'pending'
        },
        {
          status: 'rejected',
          updatedAt: Date.now()
        }
      );
    } else if (status === 'rejected') {
      // If rejected, ensure slot is available (just in case)
      // await SlotModel.findByIdAndUpdate(appointment.slotId, { isAvailable: true });
      // actually, we don't need to do anything to the slot if we just reject one request,
      // unless it was previously approved. But this endpoint is usually for pending -> decision.
    }

    ActivityModel.create({
      action: `Appointment ${status}`,
      user: `Prof. ${appointment.facultyName}`,
      type: 'appointment'
    });

    res.json({ success: true, appointment });

  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel appointment
app.put('/appointments/:id/cancel', async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const previousStatus = appointment.status;
    appointment.status = 'cancelled';
    appointment.updatedAt = Date.now();
    await appointment.save();

    // If it was approved, free up the slot
    if (previousStatus === 'approved') {
      await SlotModel.findByIdAndUpdate(appointment.slotId, { isAvailable: true });
    }

    ActivityModel.create({
      action: `Appointment cancelled`,
      user: `Student: ${appointment.studentName}`,
      type: 'appointment'
    });

    res.json({ success: true, message: 'Appointment cancelled' });

  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reschedule appointment
app.put('/appointments/:id/reschedule', async (req, res) => {
  const appointmentId = req.params.id;
  const { slotId, date, time } = req.body;

  try {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Validate new slot
    const newSlot = await SlotModel.findById(slotId);
    if (!newSlot || !newSlot.isAvailable) {
      return res.status(400).json({ success: false, message: 'New slot is not available' });
    }

    // If previous appointment was approved, free up old slot
    if (appointment.status === 'approved') {
      await SlotModel.findByIdAndUpdate(appointment.slotId, { isAvailable: true });
    }

    // Update appointment details
    appointment.slotId = slotId;
    appointment.date = date;
    appointment.time = time;
    appointment.status = 'pending'; // Reset to pending for new slot
    appointment.updatedAt = Date.now();
    await appointment.save();

    res.json({ success: true, appointment });

  } catch (err) {
    console.error('Reschedule appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get appointments for a student
app.get('/student/:id/appointments', async (req, res) => {
  const studentId = req.params.id;

  try {
    let appointments = await AppointmentModel.find({ studentId }).sort({ date: -1 });

    // Update statuses based on time
    appointments = await updateAppointmentStatuses(appointments);

    // Manually populate faculty details since facultyId is a String
    const appointmentsWithDetails = await Promise.all(appointments.map(async (appt) => {
      const apptObj = appt.toObject();

      // If name is missing or we want to ensure latest details
      if (!apptObj.facultyName || !apptObj.department) {
        const faculty = await FacultyModel.findOne({ facultyId: appt.facultyId });
        if (faculty) {
          apptObj.facultyName = faculty.fullName;
          apptObj.department = faculty.department;
          // Optionally populate facultyId as an object if frontend expects it, 
          // but frontend checks facultyName first.
        }
      }
      return apptObj;
    }));

    res.json({ success: true, appointments: appointmentsWithDetails });
  } catch (err) {
    console.error('Get student appointments error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper to check and update appointment statuses
const updateAppointmentStatuses = async (appointments) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Helper to convert 12h time to minutes for comparison
  const timeToMinutes = (timeStr) => {
    // Expected format "HH:MM AM/PM" or "HH:MM"
    const [time, period] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const updatedAppointments = await Promise.all(appointments.map(async (appt) => {
    // Skip if already in a final state
    if (['completed', 'cancelled', 'rejected'].includes(appt.status)) {
      return appt;
    }

    let shouldUpdate = false;
    let newStatus = appt.status;

    // Only auto-complete APPROVED appointments that have elapsed.
    // PENDING appointments are NEVER auto-cancelled — faculty must explicitly reject them.
    if (appt.status === 'approved') {
      if (appt.date < today) {
        // Past date approved => completed
        shouldUpdate = true;
        newStatus = 'completed';
      } else if (appt.date === today) {
        // Today - check if end time has passed
        try {
          const timeParts = appt.time.split('-');
          if (timeParts.length === 2) {
            const endTimeStr = timeParts[1].trim();
            const endMinutes = timeToMinutes(endTimeStr);
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            if (currentMinutes > endMinutes) {
              shouldUpdate = true;
              newStatus = 'completed';
            }
          }
        } catch (e) {
          console.error("Error parsing time for auto-update", e);
        }
      }
    }

    if (shouldUpdate) {
      appt.status = newStatus;
      await appt.save();

      // If we cancelled a pending request, we don't need to do anything to the slot
      // If we completed an approved request, the slot is already "taken" (unavailable), 
      // which is fine for history. Or should we free it up? Usually past slots don't matter.
    }

    return appt;
  }));

  return updatedAppointments;
};

// Get available slots for all faculty (for students to browse)
app.get('/available-slots', async (req, res) => {
  try {
    const slots = await SlotModel.find({ isAvailable: true });

    // Manually populate faculty details
    const slotsWithFaculty = await Promise.all(slots.map(async (slot) => {
      const slotObj = slot.toObject();
      const faculty = await FacultyModel.findOne({ facultyId: slot.facultyId });

      if (faculty) {
        slotObj.facultyId = {
          _id: faculty._id,
          fullName: faculty.fullName,
          department: faculty.department
        };
      }
      return slotObj;
    }));

    res.json({ success: true, slots: slotsWithFaculty });
  } catch (err) {
    console.error('Get available slots error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all faculty members
app.get('/all-faculty', (req, res) => {
  FacultyModel.find({})
    .then(faculty => {
      res.json({
        success: true,
        faculty,
        count: faculty.length
      });
    })
    .catch(err => {
      console.error('Get all faculty error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

// Get all students
app.get('/all-students', (req, res) => {
  StudentModel.find({})
    .then(students => {
      res.json({
        success: true,
        students,
        count: students.length
      });
    })
    .catch(err => {
      console.error('Get all students error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});


// Student Login
app.post('/studentlogin', (req, res) => {
  const { studentId, password } = req.body;

  StudentModel.findOne({ studentId: studentId })
    .then(user => {
      if (user) {
        if (user.password == password) {
          res.json({ success: true, message: 'Login successful', studentId: user.studentId, fullName: user.fullName });
        } else {
          res.json({ success: false, message: 'Incorrect password' });
        }
      } else {
        res.json({ success: false, message: 'No user found with this Student ID' });
      }
    })
    .catch(err => {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

// Student Registration
app.post('/studentregister', (req, res) => {
  StudentModel.create(req.body)
    .then(Student => {
      ActivityModel.create({
        action: 'New student registered',
        user: Student.fullName,
        type: 'registration'
      });
      res.json(Student);
    })
    .catch(err => res.json(err));
});

// --- ADMIN ROUTES ---

// Admin Get Stats Dashboard
app.get('/admin/stats', async (req, res) => {
  try {
    const facultyCount = await FacultyModel.countDocuments();
    const studentCount = await StudentModel.countDocuments();
    const pendingAppointments = await AppointmentModel.countDocuments({ status: 'pending' });
    const approvedAppointments = await AppointmentModel.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      stats: {
        totalFaculty: facultyCount,
        totalStudents: studentCount,
        pendingApprovals: pendingAppointments,
        totalAppointments: approvedAppointments
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Get Recent Activities
app.get('/admin/activities', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;
    let query = ActivityModel.find().sort({ timestamp: -1 });

    if (limit > 0) {
      query = query.limit(limit);
    }

    const activities = await query;
    res.json({ success: true, activities });
  } catch (err) {
    console.error('Admin activities error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Get Recent Appointments
app.get('/admin/recent-appointments', async (req, res) => {
  try {
    const appointments = await AppointmentModel.find()
      .sort({ createdAt: -1, date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    console.error('Admin recent appointments error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Delete Faculty
app.delete('/admin/users/faculty/:id', async (req, res) => {
  try {
    const faculty = await FacultyModel.findOneAndDelete({ facultyId: req.params.id });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    // Remove all their slots and appointments? Optional, but good practice
    await SlotModel.deleteMany({ facultyId: req.params.id });
    await AppointmentModel.deleteMany({ facultyId: req.params.id });

    // Log Activity
    await ActivityModel.create({
      action: 'Faculty account deleted',
      user: `Prof. ${faculty.fullName}`,
      type: 'admin'
    });

    res.json({ success: true, message: 'Faculty deleted successfully' });
  } catch (err) {
    console.error('Delete faculty error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Delete Student
app.delete('/admin/users/student/:id', async (req, res) => {
  try {
    const student = await StudentModel.findOneAndDelete({ studentId: req.params.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await AppointmentModel.deleteMany({ studentId: req.params.id });

    // Log Activity
    await ActivityModel.create({
      action: 'Student account deleted',
      user: `Student: ${student.fullName}`,
      type: 'admin'
    });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Student fetch Name
app.get('/student/:id', (req, res) => {
  const studentId = req.params.id;

  StudentModel.findOne({ studentId: studentId })
    .then(student => {
      if (student) {
        res.json({
          success: true,
          fullName: student.fullName,
          email: student.email,
          department: student.department
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
    })
    .catch(err => {
      console.error('Get student error:', err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    });
});

app.listen(8000, () => {
  console.log('it startedd');
});
