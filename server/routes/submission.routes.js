const express = require("express");
const multer = require("multer");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const authMiddleware = require("../middleware/auth");
const { calculateSimilarity } = require("../utils/textProcessor");

const router = express.Router();

// ===== FILE UPLOAD CONFIG =====
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ================= SUBMIT ASSIGNMENT =================
router.post(
  "/submit",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { assignmentId } = req.body;

      if (!req.file || !assignmentId) {
        return res.status(400).json({ msg: "Missing file or assignment ID" });
      }

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ msg: "Assignment not found" });
      }

      const content = req.file.buffer.toString("utf-8");

      // Fetch previous submissions for plagiarism check
      const previousSubmissions = await Submission.find({
        assignment: assignmentId,
      }).populate("student");

      let highestSimilarity = 0;
      let matchedWith = null;

      for (let sub of previousSubmissions) {
        const similarity = calculateSimilarity(content, sub.content);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          matchedWith = sub.student;
        }
      }

      const submission = new Submission({
        assignment: assignmentId,
        student: req.user.id,
        content,
        similarityScore: highestSimilarity,
        matchedWith: matchedWith ? matchedWith._id : null,
      });

      await submission.save();

      res.status(201).json({
        msg: "Submission successful",
        similarityScore: highestSimilarity,
      });
    } catch (err) {
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  }
);

// ================= GET SUBMISSIONS (TEACHER) =================
router.get("/assignment/:assignmentId", authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({
      assignment: req.params.assignmentId,
    })
      .populate("student", "username")
      .populate("matchedWith", "username");

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
