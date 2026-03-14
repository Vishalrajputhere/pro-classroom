const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const User = require("../models/User"); // Need to fetch student info
const { uploadBufferToCloudinary } = require("../utils/cloudinary");
const {
  extractTextFromPDF,
  calculateTFIDFSimilarity,
  getMatchedPhrases,
} = require("../utils/textProcessor");
const { generateAIExplanation } = require("../services/aiExplanationService");

// @desc    Post a new assignment (Teacher)
// @route   POST /api/assignments/post
// @access  Private
const postAssignment = async (req, res) => {
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
};

// @desc    Submit an assignment (Student)
// @route   POST /api/assignments/submit
// @access  Private
const submitAssignment = async (req, res) => {
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

    // Fetch previous submissions for the same assignment to check plagiarism
    const previousSubs = await Submission.find({
      assignment: assignmentId,
    }).populate('student', 'username email');

    const assignmentRecord = await Assignment.findById(assignmentId);
    const currentUser = await User.findById(req.user.id);

    let highestSimilarity = 0;
    let explanationData = null;
    let mostSimilarText = null;
    let matchedSubmissionId = null;
    let matchedStudent = null;

    // Compare with all previous submissions
    for (const prev of previousSubs) {
      const prevText = await extractTextFromPDF(prev.filePath);
      const score = calculateTFIDFSimilarity(newText, prevText);

      if (score > highestSimilarity) {
        highestSimilarity = score;
        mostSimilarText = prevText;
        matchedSubmissionId = prev._id;
        matchedStudent = prev.student;
      }
    }

    // Build advanced AI explanation if there's a match
    if (mostSimilarText && highestSimilarity > 0) {
      // 1. Get exact matching phrases
      const matchedPhrases = getMatchedPhrases(newText, mostSimilarText, 5, 5); // 5-grams, max 5 phrases

      // 2. Generate Human Readable Semantic Report via Service (OpenAI)
      const semanticReport = await generateAIExplanation(
          highestSimilarity,
          matchedPhrases,
          currentUser.username,
          matchedStudent.username,
          assignmentRecord.title
      );

      // 3. Assemble full explanation object
      explanationData = {
          similarityScore: highestSimilarity,
          explanationText: semanticReport,
          matchedPhrases,
          matchedSubmissionId
      };
    }

    // Save submission
    const submission = new Submission({
      assignment: assignmentId,
      student: req.user.id,
      filePath: uploadResult.secure_url,
      similarityScore: highestSimilarity,
      explanation: explanationData,
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
};

// @desc    Get all assignments for a class
// @route   GET /api/assignments/class/:classId
// @access  Private
const getAssignmentsByClass = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      class: req.params.classId,
    }).sort({ dueDate: -1 });

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch assignments" });
  }
};

module.exports = {
  postAssignment,
  submitAssignment,
  getAssignmentsByClass,
};
