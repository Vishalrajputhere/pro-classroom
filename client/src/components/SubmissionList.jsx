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
      <button onClick={onBack} className="mb-4 text-indigo-600">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4">Submissions</h2>

      {submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div
              key={s._id}
              className={`p-4 rounded shadow ${
                s.similarityScore > 50 ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <p className="font-semibold">{s.student.username}</p>
              <p>Similarity: {s.similarityScore}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubmissionList;
