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
      <button onClick={onBack} className="mb-4 text-indigo-600 font-medium">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-6">{className}</h2>

      {assignments.length === 0 ? (
        <p className="text-gray-600">No assignments yet.</p>
      ) : (
        <ul className="space-y-4">
          {assignments.map((a) => (
            <li
              key={a._id}
              onClick={() => setSelectedAssignment(a)}
              className="cursor-pointer bg-white p-5 rounded-xl shadow hover:shadow-lg transition border"
            >
              <h3 className="font-semibold text-lg">{a.title}</h3>

              <p className="text-sm text-gray-500 mt-1">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </p>

              {/* ✅ Cloudinary Assignment File */}
              {a.teacherFile && (
                <a
                  href={a.teacherFile}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block mt-2 text-sm text-indigo-600 underline"
                >
                  View Assignment File
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClassDetail;
