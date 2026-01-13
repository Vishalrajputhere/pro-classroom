import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/api";

function getRiskMeta(score) {
  if (score < 20) {
    return {
      label: "Safe",
      badge: "bg-green-100 text-green-700 border border-green-200",
      card: "bg-green-50 border-green-200",
      bar: "bg-green-500",
    };
  }
  if (score < 50) {
    return {
      label: "Moderate",
      badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      card: "bg-yellow-50 border-yellow-200",
      bar: "bg-yellow-500",
    };
  }
  return {
    label: "High Risk",
    badge: "bg-red-100 text-red-700 border border-red-200",
    card: "bg-red-50 border-red-200",
    bar: "bg-red-500",
  };
}

function SubmissionList({ assignmentId, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    apiFetch(`/api/submissions/assignment/${assignmentId}`).then(setSubmissions);
  }, [assignmentId]);

  // 📊 Summary counts (teacher quick insight)
  const summary = useMemo(() => {
    const total = submissions.length;
    let safe = 0,
      moderate = 0,
      high = 0;

    for (const s of submissions) {
      const score = Number(s.similarityScore || 0);
      if (score < 20) safe++;
      else if (score < 50) moderate++;
      else high++;
    }

    return { total, safe, moderate, high };
  }, [submissions]);

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
          View similarity score, confidence level, and explanation report for each
          submission.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
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

      {/* List */}
      {submissions.length === 0 ? (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-600">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {submissions.map((s) => {
            const score = Number(s.similarityScore || 0);
            const risk = getRiskMeta(score);
            const explanation = s.explanation;

            return (
              <div
                key={s._id}
                className={`p-5 rounded-2xl shadow-sm border transition hover:shadow-md ${risk.card}`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-lg text-gray-900 truncate">
                      {s.student?.username || "Unknown Student"}
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
                  <div className="flex items-center gap-3">
                    <a
                      href={s.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-700 font-semibold underline"
                    >
                      View Submission
                    </a>

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
                  <div className="mt-5 bg-white/70 border rounded-xl p-4">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      <span className="font-bold">Explanation:</span>{" "}
                      {explanation.explanationText ||
                        explanation.reason ||
                        "Explanation not available."}
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                      <div className="bg-white border rounded-lg p-3">
                        <p className="text-xs text-gray-500">
                          Common Words Matched
                        </p>
                        <p className="font-bold text-gray-900">
                          {explanation.commonWordCount ?? "N/A"}
                        </p>
                      </div>

                      <div className="bg-white border rounded-lg p-3">
                        <p className="text-xs text-gray-500">Similarity Score</p>
                        <p className="font-bold text-gray-900">
                          {explanation.similarityScore ?? score}%
                        </p>
                      </div>
                    </div>

                    {explanation.note && (
                      <p className="mt-3 text-xs text-gray-500 italic">
                        {explanation.note}
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
