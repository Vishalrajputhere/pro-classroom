import React, { useState } from "react";
import { apiFetch } from "../api/api";

function StudentSubmissionForm({ assignment, onBack }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", assignment._id);

    try {
      setLoading(true);
      await apiFetch("/api/submissions/submit", {
        method: "POST",
        body: formData,
      });
      setStatus("✅ Assignment submitted successfully!");
    } catch (err) {
      setStatus(err.message || "❌ Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-2xl mx-auto">
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
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Description */}
      <p className="mb-6 text-gray-700">{assignment.description}</p>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".txt,.pdf"
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
