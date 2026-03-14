const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  postAssignment,
  submitAssignment,
  getAssignmentsByClass,
} = require("../controllers/assignment.controller");

/* =====================================================
   TEACHER: POST ASSIGNMENT
   POST /api/assignments/post
===================================================== */
router.post("/post", auth, upload.single("teacherFile"), postAssignment);

/* =====================================================
   STUDENT: SUBMIT ASSIGNMENT
   POST /api/assignments/submit
===================================================== */
router.post("/submit", auth, upload.single("file"), submitAssignment);

/* =====================================================
   GET ASSIGNMENTS BY CLASS
   GET /api/assignments/class/:classId
===================================================== */
router.get("/class/:classId", auth, getAssignmentsByClass);

module.exports = router;
