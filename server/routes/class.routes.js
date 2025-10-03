const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User');
const auth = require('../middleware/auth'); 
const generateClassCode = require('../utils/classCodeGenerator'); 

// --- ROLE CHECK MIDDLEWARE (Required for all routes in this file) ---

const checkTeacherRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'teacher') {
            return res.status(403).json({ msg: 'Access denied. Only teachers can perform this action.' });
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const checkStudentRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'student') {
            return res.status(403).json({ msg: 'Access denied. Only students can perform this action.' });
        }
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- API ROUTES ---

// 1. GET /api/classes/teacher (Pulls classes for the TEACHER's dropdown)
router.get('/teacher', auth, checkTeacherRole, async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.id });
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2. GET /api/classes/student (Pulls classes for the STUDENT's dashboard)
router.get('/student', auth, checkStudentRole, async (req, res) => {
    try {
        const classes = await Class.find({ students: req.user.id });
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// 3. POST /api/classes/create
router.post('/create', auth, checkTeacherRole, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ msg: 'Class name is required.' });
        }
        const classCode = generateClassCode();
        const newClass = new Class({ name, classCode, teacher: req.user.id });
        await newClass.save();
        res.status(201).json({ msg: 'Class created successfully', class: newClass });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 4. POST /api/classes/join
router.post('/join', auth, checkStudentRole, async (req, res) => {
    try {
        const { classCode } = req.body;
        const classToJoin = await Class.findOne({ classCode: classCode.toUpperCase() });

        if (!classToJoin) {
            return res.status(404).json({ msg: 'Class code is invalid or class not found.' });
        }
        if (classToJoin.students.includes(req.user.id)) {
            return res.status(400).json({ msg: 'You are already enrolled in this class.' });
        }
        
        classToJoin.students.push(req.user.id);
        await classToJoin.save();

        res.json({ msg: `Successfully joined class: ${classToJoin.name}`, class: classToJoin });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;