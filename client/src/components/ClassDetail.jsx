import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import StudentSubmissionForm from "./StudentSubmissionForm";

function ClassDetail({ classId, className, onBack }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    apiFetch(`/api/assignments/class/${classId}`).then(setAssignments);
  }, [classId]);

  if (selectedAssignment) {
    return (
      <StudentSubmissionForm
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-indigo-600">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4">{className}</h2>

      {assignments.length === 0 ? (
        <p>No assignments yet.</p>
      ) : (
        <ul className="space-y-4">
          {assignments.map((a) => (
            <li
              key={a._id}
              onClick={() => setSelectedAssignment(a)}
              className="cursor-pointer bg-white p-4 rounded shadow"
            >
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-sm text-gray-500">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClassDetail;
