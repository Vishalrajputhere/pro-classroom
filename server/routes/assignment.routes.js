const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const mongoose = require('mongoose');

const Submission = require('../models/Submission');
const textProcessor = require('../utils/textProcessor');
const extractTextFromPDF = textProcessor.extractTextFromPDF;
const calculateCosineSimilarity = textProcessor.calculateCosineSimilarity;

const auth = require('../middleware/auth'); 
const Assignment = require('../models/Assignment');
const User = require('../models/User');

// --- MULTER STORAGE CONFIGURATION ---

// Set up storage configuration for Multer (saving locally)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save files to the 'uploads' folder in the root of the server
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Create a unique filename: timestamp-originalFilename
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

// Multer middleware initialization
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
    // Only allow PDF or TXT files
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF or TXT files are allowed.'), false);
    }
}
});

// --- ROLE CHECK MIDDLEWARE ---

// Middleware to check if the user is a student
const checkStudentRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'student') {
            return res.status(403).json({ msg: 'Access denied. Only students can submit assignments.' });
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Middleware to check if the user is a teacher (Role-Based Access Control)
const checkTeacherRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'teacher') {
            return res.status(403).json({ msg: 'Access denied. Only teachers can post assignments.' });
        }
        req.userRole = user.role;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- API ROUTE: POST ASSIGNMENT ---

// @route   POST /api/assignments/post
// @desc    Allows a teacher to create and post a new assignment
// @access  Private (Teacher Only)
router.post(
    '/post', 
    auth, 
    checkTeacherRole, 
    upload.single('teacherFile'),
    async (req, res) => {
        try {
            const { title, description, dueDate, classId } = req.body;
            const teacherFilePath = req.file ? req.file.path : null; 

            if (!title || !description || !dueDate || !classId) {
                if (teacherFilePath) fs.unlinkSync(teacherFilePath);
                return res.status(400).json({ msg: 'Please enter all required fields.' });
            }

             const newAssignment = new Assignment({
                title,
                description,
                dueDate: new Date(dueDate),
                class: classId,
                teacherFile: teacherFilePath,
                // CRITICAL FIX: ADDING THE TEACHER ID FROM THE AUTHENTICATED USER
                teacher: req.user.id 
            });

            await newAssignment.save();
            res.status(201).json({ msg: 'Assignment posted successfully', assignment: newAssignment });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);


// @route   POST /api/assignments/submit
// @desc    Allows a student to submit an assignment (with plagiarism check)
// @access  Private (Student Only)
router.post(
    '/submit',
    auth, 
    checkStudentRole, 
    upload.single('submissionFile'),
    async (req, res) => {
        const studentFilePath = req.file ? req.file.path : null;
        
        try {
            const { assignmentId } = req.body; 

            if (!assignmentId || !studentFilePath) {
                if (studentFilePath) fs.unlinkSync(studentFilePath);
                return res.status(400).json({ msg: 'Assignment ID and a file are required.' });
            }

            // 2. Check for duplicate submissions
            const existingSubmission = await Submission.findOne({
                assignment: assignmentId,
                student: req.user.id
            });

            if (existingSubmission) {
                if (studentFilePath) fs.unlinkSync(studentFilePath);
                return res.status(400).json({ msg: 'You have already submitted this assignment.' });
            }

            // 3. --- CORE PLAGIARISM CHECK ---
            const newSubmissionText = await extractTextFromPDF(studentFilePath);
            
            if (newSubmissionText.length < 50) { 
                if (studentFilePath) fs.unlinkSync(studentFilePath);
                return res.status(400).json({ msg: 'Submitted file text content is too short for analysis.' });
            }

            const previousSubmissions = await Submission.find({ assignment: assignmentId });
            let highestSimilarity = 0;
            
            for (const prevSub of previousSubmissions) {
                const prevSubmissionText = await extractTextFromPDF(prevSub.filePath);
                const similarityScore = calculateCosineSimilarity(newSubmissionText, prevSubmissionText);

                if (similarityScore > highestSimilarity) {
                    highestSimilarity = similarityScore;
                }
            }

            // 4. Save the new submission with the highest score
            const newSubmission = new Submission({
                assignment: assignmentId,
                student: req.user.id,
                filePath: studentFilePath,
                similarityScore: highestSimilarity 
            });

            await newSubmission.save();
            res.status(201).json({ 
                msg: `Submission received. Plagiarism score: ${highestSimilarity}%`, 
                submission: newSubmission 
            });

        } catch (err) {
            console.error('Submission processing error:', err.message);
            if (studentFilePath) fs.unlinkSync(studentFilePath); 
            res.status(500).send('Server Error during Submission Processing.');
        }
    }
);


// @route   GET /api/assignments/submissions/:assignmentId
// @desc    Get all submissions and scores for a specific assignment
// @access  Private (Teacher Only)
router.get('/submissions/:assignmentId', auth, checkTeacherRole, async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.assignmentId })
            // Fetch the student's username and email
            .populate('student', 'username email')
            // Fetch the assignment's title and description
            .populate('assignment', 'title description'); // <-- CRITICAL NEW POPULATE
        
        res.json(submissions);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/assignments/class/:classId
// @desc    Get all assignments for a specific class
// @access  Private
router.get('/class/:classId', auth, async (req, res) => {
    try {
        const assignments = await Assignment.find({ class: req.params.classId })
            .sort({ dueDate: -1 })
            // We can also fetch the submissions data for teachers here if needed later
            // .populate('submissions');
        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/assignments/teacher/all
// @desc    Get all assignments posted by the logged-in teacher
// @access  Private (Teacher Only)
router.get('/teacher/all', auth, checkTeacherRole, async (req, res) => {
    try {
        // 1. Find all assignments posted by the CURRENTLY authenticated teacher.
        // This relies on the fix where the assignment post route now correctly saves the 'teacher' field.
        const assignments = await Assignment.find({ teacher: req.user.id }).sort({ dueDate: 1 });

        // 2. Map over each assignment to count submissions manually
        const assignmentsWithCountPromises = assignments.map(async (assignment) => {
            
            // Count the submissions for this specific assignment
            const submissionCount = await Submission.countDocuments({ assignment: assignment._id });
            
            // Return a new object that combines the assignment data and the count
            return {
                ...assignment.toObject(), // Ensures you are working with a plain object
                submissionCount: submissionCount
            };
        });

        // 3. Wait for all counts to finish
        const assignmentsWithCount = await Promise.all(assignmentsWithCountPromises);

        res.json(assignmentsWithCount);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});





module.exports = router;