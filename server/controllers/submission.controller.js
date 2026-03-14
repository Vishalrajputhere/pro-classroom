const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @desc    Get all submissions for the logged-in student
// @route   GET /api/submissions/me
// @access  Private
const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            student: req.user.id,
        })
        .populate('assignment', 'title dueDate class')
        .sort({ createdAt: -1 });

        res.json(submissions);
    } catch (err) {
        console.error('FETCH MY SUBMISSIONS ERROR:', err);
        res.status(500).json({ msg: 'Failed to fetch your submissions' });
    }
};

// @desc    Get all submissions for a specific assignment (Teacher View)
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private
const getSubmissionsByAssignment = async (req, res) => {
    try {
        const submissions = await Submission.find({
            assignment: req.params.assignmentId,
        }).populate("student", "username email");

        res.json(submissions);
    } catch (err) {
        console.error("FETCH SUBMISSIONS ERROR:", err);
        res.status(500).json({ msg: "Failed to fetch submissions" });
    }
};

// @desc    Get a single submission by its ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).populate(
            "student",
            "username email"
        );

        if (!submission) {
            return res.status(404).json({ msg: "Submission not found" });
        }

        res.json(submission);
    } catch (err) {
        console.error("FETCH SINGLE SUBMISSION ERROR:", err);
        res.status(500).json({ msg: "Failed to fetch submission" });
    }
};

module.exports = {
    getSubmissionsByAssignment,
    getSubmissionById,
    getMySubmissions
};
