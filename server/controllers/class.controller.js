const Class = require('../models/Class');
const generateClassCode = require('../utils/classCodeGenerator');

// @desc    Get classes for the teacher
// @route   GET /api/classes/teacher
// @access  Private (Teacher only)
const getTeacherClasses = async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.id });
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get classes for the student
// @route   GET /api/classes/student
// @access  Private (Student only)
const getStudentClasses = async (req, res) => {
    try {
        const classes = await Class.find({ students: req.user.id })
            .populate('teacher', 'username email'); // Useful to show who the teacher is
        res.json(classes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new class
// @route   POST /api/classes/create
// @access  Private (Teacher only)
const createClass = async (req, res) => {
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
};

// @desc    Join an existing class using class code
// @route   POST /api/classes/join
// @access  Private (Student only)
const joinClass = async (req, res) => {
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
};

module.exports = {
    getTeacherClasses,
    getStudentClasses,
    createClass,
    joinClass
};
