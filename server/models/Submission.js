const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    // Reference to the assignment this submission is for
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    // Reference to the student who submitted the work
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // The path where the file is stored on the server (or cloud)
    filePath: {
        type: String,
        required: true,
    },
    // The similarity score (to be calculated later)
    similarityScore: {
        type: Number,
        default: 0, 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);