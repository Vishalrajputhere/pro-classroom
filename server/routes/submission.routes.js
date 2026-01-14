const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Submission = require("../models/Submission");

/* =====================================================
   TEACHER: VIEW SUBMISSIONS BY ASSIGNMENT
   GET /api/submissions/assignment/:assignmentId
===================================================== */
router.get("/assignment/:assignmentId", auth, async (req, res) => {
  try {
    const submissions = await Submission.find({
      assignment: req.params.assignmentId,
    }).populate("student", "username email");

    res.json(submissions);
  } catch (err) {
    console.error("FETCH SUBMISSIONS ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch submissions" });
  }
});

/* =====================================================
   VIEW SINGLE SUBMISSION (for matchedSubmissionId)
   GET /api/submissions/:id
===================================================== */
router.get("/:id", auth, async (req, res) => {
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
});

module.exports = router;
