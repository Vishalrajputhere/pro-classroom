import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import PostAssignmentForm from "./PostAssignmentForm";

function TeacherClassDetail({
  classId,
  className,
  onBack,
  onSelectAssignment,
}) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    const data = await apiFetch(`/api/assignments/class/${classId}`);
    setAssignments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAssignments();
  }, [classId]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-indigo-600 text-sm hover:underline"
          >
            ← Back to Classes
          </button>
          <h2 className="text-3xl font-bold mt-2">{className}</h2>
        </div>
      </div>

      {/* 🔵 Post Assignment (CLASS-SCOPED) */}
      <PostAssignmentForm
        classId={classId}
        onAssignmentPosted={loadAssignments}
      />

      {/* Assignment List */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Assignments</h3>

        {loading ? (
          <p>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p className="text-gray-600">No assignments posted yet.</p>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => (
              <div
                key={a._id}
                className="bg-white p-5 rounded-xl shadow border flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-lg">{a.title}</h4>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </p>

                  {a.teacherFile && (
                    <a
                      href={a.teacherFile}
                      download={a.teacherFileName}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 text-sm underline"
                    >
                      Download Assignment {a.teacherFileName}
                    </a>
                  )}
                </div>

                <button
                  onClick={() => onSelectAssignment(a._id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                  View Submissions
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherClassDetail;
