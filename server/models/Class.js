const mongoose = require('mongoose');

// Define the Class schema
const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // The unique code students use to join the class
    classCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    // Reference to the User (Teacher) who created the class
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true,
    },
    // Array of students' User IDs
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;