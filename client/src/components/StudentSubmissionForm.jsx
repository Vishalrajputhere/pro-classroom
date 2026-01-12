import { useState } from "react";
import { apiFetch } from "../api/api";

function StudentSubmissionForm({ assignment, onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!file) {
      setStatus("Please select a file (PDF or TXT).");
      return;
    }

    const formData = new FormData();
    formData.append("assignmentId", assignment._id);
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await apiFetch("/api/assignments/submit", {
        method: "POST",
        body: formData,
      });

      setStatus(
        `✅ Submitted successfully. Similarity Score: ${res.submission.similarityScore}%`
      );
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "❌ Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={onBack}
          className="text-indigo-600 hover:underline text-sm"
        >
          ← Back
        </button>
      </div>

      {/* Description */}
      <p className="mb-6 text-gray-700">{assignment.description}</p>

      {/* Teacher File (Cloudinary View) */}
      {assignment.teacherFile && (
        <div className="mb-6 p-4 bg-indigo-50 border rounded-lg">
          <p className="font-semibold mb-2">Assignment Instructions</p>
          <a
            href={assignment.teacherFile}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 underline"
          >
            📄 View Instruction File
          </a>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border rounded-md p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition"
        >
          {loading ? "Submitting..." : "Submit Assignment"}
        </button>
      </form>

      {/* Status */}
      {status && (
        <p className="mt-4 text-center font-medium text-gray-700">{status}</p>
      )}
    </div>
  );
}

export default StudentSubmissionForm;
