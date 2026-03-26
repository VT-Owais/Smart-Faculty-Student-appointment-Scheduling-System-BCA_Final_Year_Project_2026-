const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    action: { type: String, required: true },
    user: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, required: true }
});

const ActivityModel = mongoose.model('Activity', ActivitySchema);
module.exports = ActivityModel;
