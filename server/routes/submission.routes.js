const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary");

const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const User = require("../models/User");

const {
  extractTextFromPDF,
  calculateCosineSimilarity,
} = require("../utils/textProcessor");

const router = express.Router();

/* ================= MULTER (MEMORY) ================= */
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or TXT files allowed"), false);
    }
  },
});

/* ================= ROLE CHECK ================= */
const checkStudentRole = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user.role !== "student") {
    return res.status(403).json({ msg: "Students only" });
  }
  next();
};

/* ================= SUBMIT ASSIGNMENT ================= */
router.post(
  "/post",
  auth,
  upload.single("teacherFile"),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILE:", req.file ? "FILE RECEIVED" : "NO FILE");

      const { title, description, dueDate, classId } = req.body;

      if (!title || !description || !dueDate || !classId) {
        return res.status(400).json({ msg: "Missing fields" });
      }

      // 🟢 CASE 1: NO FILE → save assignment only
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

      // 🟢 CASE 2: FILE EXISTS → upload to cloudinary
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "assignments",
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            return res.status(500).json({ msg: "Cloudinary upload failed" });
          }

          const assignment = new Assignment({
            title,
            description,
            dueDate,
            class: classId,
            teacher: req.user.id,
            teacherFile: result.secure_url, // ✅ THIS IS WHAT YOU WANT
          });

          await assignment.save();
          res.json(assignment);
        }
      );

      // 🔥 THIS LINE IS CRITICAL
      stream.end(req.file.buffer);

    } catch (err) {
      console.error("POST ASSIGNMENT ERROR:", err);
      res.status(500).json({ msg: "Assignment upload failed" });
    }
  }
);


/* ================= TEACHER VIEW ================= */
router.get("/assignment/:assignmentId", auth, async (req, res) => {
  const submissions = await Submission.find({
    assignment: req.params.assignmentId,
  }).populate("student", "username email");

  res.json(submissions);
});

module.exports = router;
