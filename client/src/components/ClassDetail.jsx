import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/api";
import StudentSubmissionForm from "./StudentSubmissionForm";

function getDueMeta(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);

  // normalize dates (only compare date, not time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  if (dueDay < today) {
    return {
      type: "overdue",
      label: "Overdue",
      badge: "bg-red-100 text-red-700 border border-red-200",
    };
  }

  if (dueDay.getTime() === today.getTime()) {
    return {
      type: "today",
      label: "Due Today",
      badge: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    };
  }

  return {
    type: "upcoming",
    label: "Upcoming",
    badge: "bg-green-100 text-green-700 border border-green-200",
  };
}

function ClassDetail({ classId, className, onBack }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI Controls
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | upcoming | overdue | today
  const [sortBy, setSortBy] = useState("due"); // due | newest

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/assignments/class/${classId}`);
      setAssignments(Array.isArray(data) ? data : []);
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

  // summary
  const summary = useMemo(() => {
    let total = assignments.length;
    let overdue = 0;
    let upcoming = 0;
    let today = 0;

    for (const a of assignments) {
      const meta = getDueMeta(a?.dueDate);
      if (meta.type === "overdue") overdue++;
      if (meta.type === "today") today++;
      if (meta.type === "upcoming") upcoming++;
    }

    return { total, overdue, today, upcoming };
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = [...assignments];

    // search by title
    if (q) {
      list = list.filter((a) => (a?.title || "").toLowerCase().includes(q));
    }

    // filter by due meta
    if (filter !== "all") {
      list = list.filter((a) => getDueMeta(a?.dueDate).type === filter);
    }

    // sorting
    if (sortBy === "due") {
      list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [assignments, search, filter, sortBy]);

  if (selectedAssignment) {
    return (
      <StudentSubmissionForm
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-extrabold text-gray-900">
            {summary.total}
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Upcoming</p>
          <p className="text-2xl font-extrabold text-green-700">
            {summary.upcoming}
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Due Today</p>
          <p className="text-2xl font-extrabold text-yellow-700">
            {summary.today}
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-2xl font-extrabold text-red-700">
            {summary.overdue}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments by title..."
              className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-xl px-3 py-2.5 bg-white"
          >
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Due Today</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-xl px-3 py-2.5 bg-white"
          >
            <option value="due">Sort: Nearest Due</option>
            <option value="newest">Sort: Latest Posted</option>
          </select>

          {/* Clear */}
          {(search || filter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="text-sm font-semibold text-indigo-700 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white border rounded-2xl p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-gray-900">
            No assignments found
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Try changing the search or filter options.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredAssignments.map((a) => {
            const dueMeta = getDueMeta(a?.dueDate);

            return (
              <div
                key={a._id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xl text-gray-900 truncate">
                      {a?.title || "Untitled Assignment"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <p className="text-sm text-gray-600">
                        Due:{" "}
                        <span className="font-semibold">
                          {a?.dueDate
                            ? new Date(a.dueDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </p>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border ${dueMeta.badge}`}
                      >
                        {dueMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Open button */}
                  <button
                    onClick={() => setSelectedAssignment(a)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    Open
                  </button>
                </div>

                {/* Description */}
                {a?.description && (
                  <p className="text-sm text-gray-700 mt-4 line-clamp-2">
                    {a.description}
                  </p>
                )}

                {/* Teacher File */}
                {a?.teacherFile && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={a.teacherFile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-700 underline font-semibold"
                    >
                      📄 View Instructions
                    </a>

                    <a
                      href={a.teacherFile}
                      download
                      className="text-sm text-indigo-700 underline font-semibold"
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
