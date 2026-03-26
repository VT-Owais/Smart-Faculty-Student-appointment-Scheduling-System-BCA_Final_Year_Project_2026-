const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentId: String,
    fullName: String,
    email: String,
    semester: String,
    department: String,
    password: String,
})

const StudentModel = mongoose.model('Student', StudentSchema)
module.exports = StudentModel