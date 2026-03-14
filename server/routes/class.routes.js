const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const { checkTeacherRole, checkStudentRole } = require('../middleware/roleCheck'); 
const { 
    getTeacherClasses, 
    getStudentClasses, 
    createClass, 
    joinClass 
} = require('../controllers/class.controller');

// --- API ROUTES ---

// 1. GET /api/classes/teacher (Pulls classes for the TEACHER's dropdown)
router.get('/teacher', auth, checkTeacherRole, getTeacherClasses);

// 2. GET /api/classes/student (Pulls classes for the STUDENT's dashboard)
router.get('/student', auth, checkStudentRole, getStudentClasses);

// 3. POST /api/classes/create
router.post('/create', auth, checkTeacherRole, createClass);

// 4. POST /api/classes/join
router.post('/join', auth, checkStudentRole, joinClass);

module.exports = router;