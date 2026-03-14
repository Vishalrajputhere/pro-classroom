const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { getSubmissionsByAssignment, getSubmissionById, getMySubmissions } = require("../controllers/submission.controller");

/* =====================================================
   STUDENT: VIEW OWN SUBMISSIONS
   GET /api/submissions/me
===================================================== */
router.get("/me", auth, getMySubmissions);

/* =====================================================
   TEACHER: VIEW SUBMISSIONS BY ASSIGNMENT
   GET /api/submissions/assignment/:assignmentId
===================================================== */
router.get("/assignment/:assignmentId", auth, getSubmissionsByAssignment);

/* =====================================================
   VIEW SINGLE SUBMISSION (for matchedSubmissionId)
   GET /api/submissions/:id
===================================================== */
router.get("/:id", auth, getSubmissionById);

module.exports = router;
