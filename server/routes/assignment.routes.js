const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const { uploadBufferToCloudinary } = require("../utils/cloudinary");

const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const {
  extractTextFromPDF,
  calculateCosineSimilarity,
  buildHumanReadableExplanation,
} = require("../utils/textProcessor");

/* =====================================================
   TEACHER: POST ASSIGNMENT
   POST /api/assignments/post
===================================================== */
router.post("/post", auth, upload.single("teacherFile"), async (req, res) => {
  try {
    const { title, description, dueDate, classId } = req.body;

    if (!title || !description || !dueDate || !classId) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    // CASE 1: NO FILE
    if (!req.file) {
      const assignment = new Assignment({
        title,
        description,
        dueDate,
        class: classId,
        teacher: req.user.id,
      });

      await assignment.save();
      return res.json(assignment);
    }

    // CASE 2: FILE EXISTS
    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      "assignments",
      req.file.originalname
    );

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      class: classId,
      teacher: req.user.id,
      teacherFile: uploadResult.secure_url,
      teacherFileName: req.file.originalname,
    });

    await assignment.save();
    return res.json(assignment);
  } catch (err) {
    console.error("POST ASSIGNMENT ERROR:", err);
    res.status(500).json({ msg: "Assignment upload failed" });
  }
});

/* =====================================================
   STUDENT: SUBMIT ASSIGNMENT
   POST /api/assignments/submit
===================================================== */
router.post("/submit", auth, upload.single("file"), async (req, res) => {
  try {
    const { assignmentId } = req.body;

    if (!assignmentId || !req.file) {
      return res.status(400).json({ msg: "File and assignmentId required" });
    }

    // Prevent duplicate submission
    const alreadySubmitted = await Submission.findOne({
      assignment: assignmentId,
      student: req.user.id,
    });

    if (alreadySubmitted) {
      return res
        .status(400)
        .json({ msg: "You already submitted this assignment" });
    }

    // Upload student file to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      "submissions",
      req.file.originalname
    );

    // Extract text from new submission
    const newText = await extractTextFromPDF(uploadResult.secure_url);

    // Fetch previous submissions
    const previousSubs = await Submission.find({
      assignment: assignmentId,
    });

    let highestSimilarity = 0;
    let explanation = null;
    let mostSimilarText = null;
    let matchedSubmissionId = null;

    for (const prev of previousSubs) {
      const prevText = await extractTextFromPDF(prev.filePath);
      const score = calculateCosineSimilarity(newText, prevText);

      if (score > highestSimilarity) {
        highestSimilarity = score;
        mostSimilarText = prevText;
        matchedSubmissionId = prev._id;
      }
    }

    // Build explanation
    if (mostSimilarText && highestSimilarity > 0) {
      explanation = buildHumanReadableExplanation(
        newText,
        mostSimilarText,
        highestSimilarity
      );

      // attach matched submission id (helpful for teacher)
      explanation.matchedSubmissionId = matchedSubmissionId;
    }

    // Save submission
    const submission = new Submission({
      assignment: assignmentId,
      student: req.user.id,
      filePath: uploadResult.secure_url,
      similarityScore: highestSimilarity,
      explanation,
    });

    await submission.save();

    res.status(201).json({
      msg: "Submission successful",
      submission,
    });
  } catch (err) {
    console.error("SUBMISSION ERROR:", err);
    res.status(500).json({ msg: "Submission failed" });
  }
});

/* =====================================================
   GET ASSIGNMENTS BY CLASS
   GET /api/assignments/class/:classId
===================================================== */
router.get("/class/:classId", auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      class: req.params.classId,
    }).sort({ dueDate: -1 });

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch assignments" });
  }
});

module.exports = router;
