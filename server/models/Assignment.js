const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    // Reference to the class this assignment belongs to
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    // Optional: reference to a file uploaded by the teacher (e.g., instructions)
    teacherFile: { 
        type: String, 
        required: false 
    },

    // 👇 NEW FIELD: store which teacher created this assignment
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
