import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

function SubmissionList({ assignmentId, onBack }) {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    apiFetch(`/api/submissions/assignment/${assignmentId}`).then(
      setSubmissions
    );
  }, [assignmentId]);

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-indigo-600 font-medium">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-6">Student Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-gray-600">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div
              key={s._id}
              className={`p-5 rounded-xl shadow border ${
                s.similarityScore > 50
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{s.student.username}</p>
                  <p className="text-sm text-gray-600">
                    Similarity:{" "}
                    <span className="font-bold">{s.similarityScore}%</span>
                  </p>
                </div>

                {/* ✅ Cloudinary Submission File */}
                <a
                  href={s.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-indigo-600 underline"
                >
                  View Submission
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubmissionList;
