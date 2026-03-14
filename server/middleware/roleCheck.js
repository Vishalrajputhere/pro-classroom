const User = require('../models/User');

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

module.exports = {
    checkTeacherRole,
    checkStudentRole
};
