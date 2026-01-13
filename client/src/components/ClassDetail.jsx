import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/api";
import StudentSubmissionForm from "./StudentSubmissionForm";

function getDueMeta(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);

  const isOverdue = due < now;
  if (isOverdue) {
    return {
      label: "Overdue",
      badge: "bg-red-100 text-red-700",
    };
  }

  return {
    label: "Upcoming",
    badge: "bg-green-100 text-green-700",
  };
}

function ClassDetail({ classId, className, onBack }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/assignments/class/${classId}`);
      setAssignments(data);
    } catch (err) {
      console.error(err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [classId]);

  const sortedAssignments = useMemo(() => {
    // Newest first OR nearest due date first (choose what you prefer)
    return [...assignments].sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    );
  }, [assignments]);

  if (selectedAssignment) {
    return (
      <StudentSubmissionForm
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-extrabold mt-2 text-gray-900">
            {className}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            View assignments and submit your work here.
          </p>
        </div>

        <button
          onClick={loadAssignments}
          className="text-sm font-semibold px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 transition"
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : sortedAssignments.length === 0 ? (
        <div className="bg-white border rounded-2xl p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-gray-900">
            No assignments posted yet
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Your teacher hasn’t uploaded any assignment for this class.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedAssignments.map((a) => {
            const dueMeta = getDueMeta(a.dueDate);

            return (
              <div
                key={a._id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-xl text-gray-900 truncate">
                      {a.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <p className="text-sm text-gray-600">
                        Due:{" "}
                        <span className="font-semibold">
                          {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      </p>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${dueMeta.badge}`}
                      >
                        {dueMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Open button */}
                  <button
                    onClick={() => setSelectedAssignment(a)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Open
                  </button>
                </div>

                {/* Description */}
                {a.description && (
                  <p className="text-sm text-gray-700 mt-4 line-clamp-2">
                    {a.description}
                  </p>
                )}

                {/* Teacher File */}
                {a.teacherFile && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={a.teacherFile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-600 underline font-medium"
                    >
                      📄 View Instructions
                    </a>

                    <a
                      href={a.teacherFile}
                      download
                      className="text-sm text-indigo-600 underline font-medium"
                    >
                      ⬇️ Download
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClassDetail;
