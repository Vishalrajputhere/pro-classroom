import { useEffect, useMemo, useState } from "react";
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
    try {
      setLoading(true);
      const data = await apiFetch(`/api/assignments/class/${classId}`);
      setAssignments(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [classId]);

  // 📌 Summary counts
  const summary = useMemo(() => {
    const total = assignments.length;
    const withFile = assignments.filter((a) => !!a.teacherFile).length;
    const withoutFile = total - withFile;

    return { total, withFile, withoutFile };
  }, [assignments]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="text-indigo-600 text-sm font-medium hover:underline"
          >
            ← Back to Classes
          </button>

          <h2 className="text-3xl font-extrabold mt-2 text-gray-900">
            {className}
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Post assignments for this class and review plagiarism reports.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
            <p className="text-[11px] text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
            <p className="text-[11px] text-gray-500">With File</p>
            <p className="text-xl font-bold text-indigo-700">
              {summary.withFile}
            </p>
          </div>
          <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
            <p className="text-[11px] text-gray-500">No File</p>
            <p className="text-xl font-bold text-gray-700">
              {summary.withoutFile}
            </p>
          </div>
        </div>
      </div>

      {/* Post Assignment */}
      <div className="mb-10">
        <PostAssignmentForm
          classId={classId}
          onAssignmentPosted={loadAssignments}
        />
      </div>

      {/* Assignment List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Assignments</h3>

          <button
            onClick={loadAssignments}
            className="text-sm font-semibold text-indigo-700 hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <p className="text-gray-500 text-sm">Loading assignments...</p>
            </div>
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <p className="text-gray-500 text-sm">Loading assignments...</p>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <p className="text-gray-600">No assignments posted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => {
              const due = a?.dueDate ? new Date(a.dueDate) : null;
              const created = a?.createdAt ? new Date(a.createdAt) : null;

              return (
                <div
                  key={a._id}
                  className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left Side */}
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-lg text-gray-900 truncate">
                        {a.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {due && (
                          <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                            Due: {due.toLocaleDateString()}
                          </span>
                        )}

                        {created && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-600 border font-medium">
                            Posted: {created.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* File Section */}
                      {a.teacherFile ? (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <a
                            href={a.teacherFile}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-indigo-700 underline"
                          >
                            View File
                          </a>

                          {/* Download works best if cloudinary sends correct content-type */}
                          <a
                            href={a.teacherFile}
                            download={a.teacherFileName || "assignment.pdf"}
                            className="text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                          >
                            Download {a.teacherFileName || ""}
                          </a>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-gray-500">
                          No attachment uploaded.
                        </p>
                      )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onSelectAssignment(a._id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition"
                      >
                        View Submissions
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherClassDetail;
