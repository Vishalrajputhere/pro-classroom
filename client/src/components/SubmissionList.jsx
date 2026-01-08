import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

function SubmissionList({ assignmentId, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📥 Fetch submissions for assignment
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(
          `/api/submissions/assignment/${assignmentId}`
        );
        setSubmissions(data);
      } catch (err) {
        setError(err.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  if (loading) {
    return <p className="mt-10 text-center">Loading submissions...</p>;
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Assignment Submissions</h2>
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
        >
          ← Back
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

      {/* No submissions */}
      {submissions.length === 0 && !error && (
        <p className="text-gray-600">
          No students have submitted this assignment yet.
        </p>
      )}

      {/* Submissions Table */}
      {submissions.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Similarity %
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Compared With
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((sub) => {
                const similarity = Math.round((sub.similarityScore || 0) * 100);

                return (
                  <tr key={sub._id} className="border-t">
                    <td className="px-6 py-4">
                      {sub.student?.username || "Unknown"}
                    </td>

                    <td className="px-6 py-4">{similarity}%</td>

                    <td className="px-6 py-4">
                      {sub.matchedWith ? sub.matchedWith.username : "—"}
                    </td>

                    <td className="px-6 py-4">
                      {similarity >= 70 ? (
                        <span className="text-red-600 font-semibold">
                          High Plagiarism
                        </span>
                      ) : similarity >= 40 ? (
                        <span className="text-yellow-600 font-semibold">
                          Medium Risk
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Safe
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SubmissionList;
