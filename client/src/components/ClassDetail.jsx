import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import StudentSubmissionForm from "./StudentSubmissionForm";

function ClassDetail({ classId, className, onBack }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📘 Fetch assignments for this class
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/assignments/class/${classId}`);
        setAssignments(data);
      } catch (err) {
        setError(err.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [classId]);

  if (loading) {
    return <p className="mt-10 text-center">Loading assignments...</p>;
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{className}</h2>
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
        >
          ← Back
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}

      {/* Assignment List */}
      {!selectedAssignment && (
        <>
          {assignments.length === 0 ? (
            <p className="text-gray-600">
              No assignments have been posted yet.
            </p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="p-5 bg-white border rounded-lg shadow hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                    >
                      View / Submit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Submission Form */}
      {selectedAssignment && (
        <StudentSubmissionForm
          assignment={selectedAssignment}
          onBack={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
}

export default ClassDetail;
