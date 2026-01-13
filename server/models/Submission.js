const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    // Reference to the assignment
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    // Reference to the student
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Cloudinary file URL
    filePath: {
      type: String,
      required: true,
    },

    // Final plagiarism percentage
    similarityScore: {
      type: Number,
      default: 0,
    },

    // ✅ NEW: Detailed plagiarism explanation
    explanation: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
