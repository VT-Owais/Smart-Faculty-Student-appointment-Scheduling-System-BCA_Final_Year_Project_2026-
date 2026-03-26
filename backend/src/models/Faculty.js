const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
    facultyId: String,
    fullName: String,
    email: String,
    department: String,
    password: String,
    blockedStudents: { type: [String], default: [] },
})

const FacultyModel = mongoose.model('Faculty', FacultySchema)
module.exports = FacultyModel