import { useMemo, useState } from "react";
import { apiFetch } from "../api/api";

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getRiskMeta(score) {
  if (score < 20) {
    return {
      label: "Safe",
      badge: "bg-green-100 text-green-700",
      box: "bg-green-50 border-green-200",
    };
  }
  if (score < 50) {
    return {
      label: "Moderate",
      badge: "bg-yellow-100 text-yellow-700",
      box: "bg-yellow-50 border-yellow-200",
    };
  }
  return {
    label: "High Risk",
    badge: "bg-red-100 text-red-700",
    box: "bg-red-50 border-red-200",
  };
}

function StudentSubmissionForm({ assignment, onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI result state
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null); // { similarityScore, explanation }

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      type: file.type || "unknown",
      size: formatFileSize(file.size),
    };
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setResult(null);

    if (!file) {
      setStatus("❌ Please select a file (PDF or TXT).");
      return;
    }

    const formData = new FormData();
    formData.append("assignmentId", assignment._id);
    formData.append("file", file); // 🔥 MUST MATCH upload.single("file")

    try {
      setLoading(true);

      const res = await apiFetch("/api/assignments/submit", {
        method: "POST",
        body: formData,
      });

      const similarityScore = res?.submission?.similarityScore ?? 0;
      const explanation = res?.submission?.explanation ?? null;

      setResult({ similarityScore, explanation });

      setStatus("✅ Submitted successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "❌ Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const dueDateText = useMemo(() => {
    try {
      return new Date(assignment.dueDate).toLocaleDateString();
    } catch {
      return assignment.dueDate;
    }
  }, [assignment.dueDate]);

  const score = result?.similarityScore ?? null;
  const risk = score !== null ? getRiskMeta(score) : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top Back */}
      <button
        onClick={onBack}
        className="mb-4 text-indigo-600 hover:underline text-sm font-medium"
      >
        ← Back
      </button>

      {/* Main Card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold text-gray-900 truncate">
              {assignment.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Due: {dueDateText}</p>
          </div>

          {risk && (
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold ${risk.badge}`}
            >
              {risk.label}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mt-5">
          <p className="text-gray-700 leading-relaxed">
            {assignment.description}
          </p>
        </div>

        {/* Teacher File */}
        {assignment.teacherFile && (
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="font-semibold text-indigo-900 mb-2">
              Assignment Instructions
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={assignment.teacherFile}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-700 underline font-medium"
              >
                📄 View File
              </a>

              <a
                href={assignment.teacherFile}
                download
                className="text-sm text-indigo-700 underline font-medium"
              >
                ⬇️ Download
              </a>
            </div>

            <p className="text-xs text-indigo-700/80 mt-2">
              Tip: If it doesn’t open in browser, use Download.
            </p>
          </div>
        )}

        {/* Submission Form */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Submit Your Work
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border rounded-xl p-4 bg-gray-50">
              <label className="text-sm font-semibold text-gray-700">
                Upload File (PDF/TXT)
              </label>

              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full mt-2 text-sm"
              />

              {fileMeta && (
                <div className="mt-3 bg-white border rounded-xl p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      📎 {fileMeta.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Type: <span className="font-medium">{fileMeta.type}</span>{" "}
                      • Size:{" "}
                      <span className="font-medium">{fileMeta.size}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Your submission will be checked for similarity with other
                submissions.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full font-semibold py-3 rounded-xl transition ${
                loading || !file
                  ? "bg-indigo-300 text-white cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? "Submitting..." : "Submit Assignment"}
            </button>
          </form>

          {/* Status */}
          {status && (
            <p
              className={`mt-4 text-center font-semibold ${
                status.includes("❌") ? "text-red-600" : "text-green-700"
              }`}
            >
              {status}
            </p>
          )}

          {/* Result Box */}
          {result && (
            <div className={`mt-5 p-4 rounded-xl border ${risk?.box || ""}`}>
              <p className="text-sm font-semibold text-gray-900">
                Similarity Score:{" "}
                <span className="font-extrabold">
                  {result.similarityScore}%
                </span>
              </p>

              {result?.explanation?.explanationText && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">Why?</span>{" "}
                  {result.explanation.explanationText}
                </p>
              )}

              {result?.explanation?.commonWordCount !== undefined && (
                <p className="text-xs text-gray-600 mt-2">
                  Common matched words:{" "}
                  <span className="font-semibold">
                    {result.explanation.commonWordCount}
                  </span>
                </p>
              )}

              {result?.explanation?.note && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  {result.explanation.note}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentSubmissionForm;
