import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/api";

function getRiskMeta(score) {
  if (score < 20) {
    return {
      label: "Safe",
      badge: "bg-green-100 text-green-700 border border-green-200",
      card: "bg-green-50 border-green-200",
      bar: "bg-green-500",
      key: "safe",
    };
  }
  if (score < 50) {
    return {
      label: "Moderate",
      badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      card: "bg-yellow-50 border-yellow-200",
      bar: "bg-yellow-500",
      key: "moderate",
    };
  }
  return {
    label: "High Risk",
    badge: "bg-red-100 text-red-700 border border-red-200",
    card: "bg-red-50 border-red-200",
    bar: "bg-red-500",
    key: "high",
  };
}

function SubmissionList({ assignmentId, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeftUrl, setCompareLeftUrl] = useState(null);
  const [compareRightUrl, setCompareRightUrl] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // ✅ NEW: filters/search/sort
  const [filter, setFilter] = useState("all"); // all | safe | moderate | high
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("highest"); // highest | lowest | newest | oldest

  useEffect(() => {
    const loadSubs = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(
          `/api/submissions/assignment/${assignmentId}`
        );
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load submissions:", err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubs();
  }, [assignmentId]);

  // 📊 Summary counts (teacher quick insight)
  const summary = useMemo(() => {
    const total = submissions.length;
    let safe = 0,
      moderate = 0,
      high = 0;

    for (const s of submissions) {
      const score = Number(s?.similarityScore || 0);
      if (score < 20) safe++;
      else if (score < 50) moderate++;
      else high++;
    }

    return { total, safe, moderate, high };
  }, [submissions]);

  // ✅ NEW: filtered + searched + sorted list
  const visibleSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list = submissions.map((s) => {
      const score = Number(s?.similarityScore || 0);
      const risk = getRiskMeta(score);
      return { ...s, __score: score, __riskKey: risk.key };
    });

    // Filter by risk
    if (filter !== "all") {
      list = list.filter((s) => s.__riskKey === filter);
    }

    // Search by student username/email
    if (query) {
      list = list.filter((s) => {
        const username = (s?.student?.username || "").toLowerCase();
        const email = (s?.student?.email || "").toLowerCase();
        return username.includes(query) || email.includes(query);
      });
    }

    // Sort
    if (sortBy === "highest") {
      list.sort((a, b) => b.__score - a.__score);
    } else if (sortBy === "lowest") {
      list.sort((a, b) => a.__score - b.__score);
    } else if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime()
      );
    } else if (sortBy === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a?.createdAt || 0).getTime() -
          new Date(b?.createdAt || 0).getTime()
      );
    }

    return list;
  }, [submissions, filter, search, sortBy]);

  const activeFilterClass = "bg-indigo-600 text-white border-indigo-600";
  const inactiveFilterClass =
    "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";

  function PreviewModal({ open, onClose, leftUrl, rightUrl }) {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal Box */}
        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-extrabold text-gray-900">
              🔍 Compare Submissions
            </h3>

            <button
              onClick={onClose}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg border bg-gray-50 hover:bg-gray-100"
            >
              ✖ Close
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left */}
            <div className="border-r">
              <div className="px-4 py-2 border-b bg-gray-50">
                <p className="text-sm font-bold text-gray-900">
                  Student Submission
                </p>
              </div>

              {leftUrl ? (
                <iframe
                  src={leftUrl}
                  title="Student Submission"
                  className="w-full h-[70vh]"
                />
              ) : (
                <div className="p-6 text-gray-600 text-sm">
                  File not available.
                </div>
              )}
            </div>

            {/* Right */}
            <div>
              <div className="px-4 py-2 border-b bg-gray-50">
                <p className="text-sm font-bold text-gray-900">
                  Matched Submission
                </p>
              </div>

              {rightUrl ? (
                <iframe
                  src={rightUrl}
                  title="Matched Submission"
                  className="w-full h-[70vh]"
                />
              ) : (
                <div className="p-6 text-gray-600 text-sm">
                  Matched file not available.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t bg-white">
            <div className="text-xs text-gray-500">
              Tip: If PDF doesn’t render inside iframe, open in new tab.
            </div>

            <div className="flex gap-2">
              {leftUrl && (
                <a
                  href={leftUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
                >
                  Open Left ↗
                </a>
              )}
              {rightUrl && (
                <a
                  href={rightUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
                >
                  Open Right ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-indigo-600 font-medium hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Student Submissions
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          View similarity score, confidence level, and explanation report for
          each submission.
        </p>
      </div>

      <PreviewModal
        open={compareOpen}
        onClose={() => {
          setCompareOpen(false);
          setCompareLeftUrl(null);
          setCompareRightUrl(null);
        }}
        leftUrl={compareLeftUrl}
        rightUrl={compareRightUrl}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Safe (&lt;20%)</p>
          <p className="text-2xl font-bold text-green-700">{summary.safe}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Moderate (20–49%)</p>
          <p className="text-2xl font-bold text-yellow-700">
            {summary.moderate}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">High Risk (50%+)</p>
          <p className="text-2xl font-bold text-red-700">{summary.high}</p>
        </div>
      </div>

      {/* ✅ Filters + Search + Sort */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition ${
                filter === "all" ? activeFilterClass : inactiveFilterClass
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilter("safe")}
              className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition ${
                filter === "safe" ? activeFilterClass : inactiveFilterClass
              }`}
            >
              Safe
            </button>

            <button
              onClick={() => setFilter("moderate")}
              className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition ${
                filter === "moderate" ? activeFilterClass : inactiveFilterClass
              }`}
            >
              Moderate
            </button>

            <button
              onClick={() => setFilter("high")}
              className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition ${
                filter === "high" ? activeFilterClass : inactiveFilterClass
              }`}
            >
              High Risk
            </button>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student (username/email)"
              className="w-full sm:w-72 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="highest">Sort: Highest similarity</option>
              <option value="lowest">Sort: Lowest similarity</option>
              <option value="newest">Sort: Newest first</option>
              <option value="oldest">Sort: Oldest first</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-500 mt-3">
          Showing{" "}
          <span className="font-semibold">{visibleSubmissions.length}</span> of{" "}
          <span className="font-semibold">{submissions.length}</span>{" "}
          submissions
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      ) : visibleSubmissions.length === 0 ? (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-600">
            No submissions found for this filter/search.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {visibleSubmissions.map((s) => {
            const score = Number(s?.similarityScore || 0);
            const risk = getRiskMeta(score);
            const explanation = s?.explanation || null;

            return (
              <div
                key={s._id}
                className={`p-5 rounded-2xl shadow-sm border transition hover:shadow-md ${risk.card}`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-lg text-gray-900 truncate">
                      {s?.student?.username || "Unknown Student"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-sm text-gray-800">
                        Similarity:{" "}
                        <span className="font-extrabold">{score}%</span>
                      </span>

                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${risk.badge}`}
                      >
                        {risk.label}
                      </span>

                      {s?.createdAt && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 border text-gray-600 font-semibold">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Similarity Bar */}
                    <div className="mt-3">
                      <div className="h-2 w-full bg-white/70 rounded-full overflow-hidden border">
                        <div
                          className={`h-full ${risk.bar}`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-600 mt-1">
                        Confidence Level:{" "}
                        <span className="font-semibold">{risk.label}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {s?.filePath && (
                      <a
                        href={s.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-indigo-700 font-semibold underline"
                      >
                        View Submission
                      </a>
                    )}

                    {/* ✅ NEW: View Matched Submission */}
                    {explanation?.matchedSubmissionId && (
                      <button
                        disabled={compareLoading}
                        onClick={async () => {
                          try {
                            setCompareLoading(true);

                            // left = current submission
                            const left = s?.filePath;

                            // right = matched submission fetched from backend
                            const matched = await apiFetch(
                              `/api/submissions/${explanation.matchedSubmissionId}`
                            );

                            const right = matched?.filePath || null;

                            setCompareLeftUrl(left || null);
                            setCompareRightUrl(right);

                            setCompareOpen(true);
                          } catch (err) {
                            console.error(
                              "Failed to load matched submission:",
                              err
                            );
                            alert("Failed to compare matched submission.");
                          } finally {
                            setCompareLoading(false);
                          }
                        }}
                        className={`text-sm font-semibold px-3 py-1.5 rounded-lg border transition ${
                          compareLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white/70 text-indigo-700 hover:bg-white"
                        }`}
                      >
                        {compareLoading ? "Opening..." : "Compare ↔"}
                      </button>
                    )}

                    {explanation && (
                      <button
                        onClick={() =>
                          setOpenId(openId === s._id ? null : s._id)
                        }
                        className="text-sm font-semibold text-gray-800 bg-white/70 border px-3 py-1.5 rounded-lg hover:bg-white transition"
                      >
                        {openId === s._id ? "Hide Report" : "Why this score?"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Explanation Panel */}
                {explanation && openId === s._id && (
                  <div className="mt-5 bg-white/70 border rounded-xl p-4 space-y-4">
                    {/* Main explanation */}
                    <p className="text-sm text-gray-800 leading-relaxed">
                      <span className="font-bold">Explanation:</span>{" "}
                      {explanation.explanationText ||
                        explanation.reason ||
                        "Explanation not available."}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                      <div className="bg-white border rounded-lg p-3">
                        <p className="text-xs text-gray-500">
                          Common Words Matched
                        </p>
                        <p className="font-bold text-gray-900">
                          {explanation.commonWordCount ?? "N/A"}
                        </p>
                      </div>

                      <div className="bg-white border rounded-lg p-3">
                        <p className="text-xs text-gray-500">
                          Similarity Score
                        </p>
                        <p className="font-bold text-gray-900">
                          {explanation.similarityScore ?? score}%
                        </p>
                      </div>
                    </div>

                    {/* ✅ NEW: Matched Keywords */}
                    {Array.isArray(explanation.matchedKeywords) &&
                      explanation.matchedKeywords.length > 0 && (
                        <div>
                          <p className="text-sm font-bold text-gray-900 mb-2">
                            🔑 Matched Keywords
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {explanation.matchedKeywords.map((word, idx) => (
                              <span
                                key={`${word}-${idx}`}
                                className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* ✅ NEW: Matched Phrases */}
                    {Array.isArray(explanation.matchedPhrases) &&
                      explanation.matchedPhrases.length > 0 && (
                        <div>
                          <p className="text-sm font-bold text-gray-900 mb-2">
                            🧩 Matched Phrases
                          </p>

                          <div className="space-y-2">
                            {explanation.matchedPhrases.map((phrase, idx) => (
                              <div
                                key={`${phrase}-${idx}`}
                                className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-800"
                              >
                                “{phrase}”
                              </div>
                            ))}
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            These are phrase-level overlaps found between
                            submissions.
                          </p>
                        </div>
                      )}

                    {/* Notes */}
                    {explanation.note && (
                      <p className="text-xs text-gray-500 italic">
                        {explanation.note}
                      </p>
                    )}

                    {/* Matched submission id */}
                    {explanation.matchedSubmissionId && (
                      <p className="text-xs text-gray-600">
                        Matched with Submission ID:{" "}
                        <span className="font-semibold">
                          {explanation.matchedSubmissionId}
                        </span>
                      </p>
                    )}
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

export default SubmissionList;
