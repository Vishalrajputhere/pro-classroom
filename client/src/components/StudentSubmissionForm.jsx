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
      badge: "bg-green-100 text-green-700 border border-green-200",
      box: "bg-green-50 border-green-200",
      bar: "bg-green-500",
    };
  }
  if (score < 50) {
    return {
      label: "Moderate",
      badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      box: "bg-yellow-50 border-yellow-200",
      bar: "bg-yellow-500",
    };
  }
  return {
    label: "High Risk",
    badge: "bg-red-100 text-red-700 border border-red-200",
    box: "bg-red-50 border-red-200",
    bar: "bg-red-500",
  };
}

function StudentSubmissionForm({ assignment, onBack }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(false);

  // UI result state
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null); // { similarityScore, explanation, filePath }

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      type: file.type || "unknown",
      size: formatFileSize(file.size),
    };
  }, [file]);

  const dueDateText = useMemo(() => {
    try {
      return new Date(assignment.dueDate).toLocaleDateString();
    } catch {
      return assignment.dueDate;
    }
  }, [assignment.dueDate]);

  const score = result?.similarityScore ?? null;
  const risk = score !== null ? getRiskMeta(score) : null;

  const isSubmitDisabled = loading || !file;

  const validateFile = (f) => {
    if (!f) return "No file selected";
    const allowed = ["application/pdf", "text/plain"];
    const extAllowed =
      f.name?.toLowerCase().endsWith(".pdf") ||
      f.name?.toLowerCase().endsWith(".txt");

    // some browsers may not send correct mimetype for txt
    if (!allowed.includes(f.type) && !extAllowed) {
      return "Only PDF or TXT files are allowed.";
    }
    return null;
  };

  const handleFilePick = (f) => {
    const error = validateFile(f);
    if (error) {
      setStatus(`❌ ${error}`);
      setFile(null);
      return;
    }
    setStatus("");
    setResult(null);
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setResult(null);

    if (!file) {
      setStatus("❌ Please select a file (PDF or TXT).");
      return;
    }

    const error = validateFile(file);
    if (error) {
      setStatus(`❌ ${error}`);
      return;
    }

    const formData = new FormData();
    formData.append("assignmentId", assignment._id);
    formData.append("file", file); // MUST MATCH upload.single("file")

    try {
      setLoading(true);

      const res = await apiFetch("/api/assignments/submit", {
        method: "POST",
        body: formData,
      });

      const similarityScore = res?.submission?.similarityScore ?? 0;
      const explanation = res?.submission?.explanation ?? null;
      const filePath = res?.submission?.filePath ?? null;

      setResult({ similarityScore, explanation, filePath });
      setStatus("✅ Submitted successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "❌ Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFilePick(dropped);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

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

          {/* Show badge ONLY after submission */}
          {risk && (
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold border ${risk.badge}`}
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
            {/* Drag & Drop Area */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`rounded-2xl border p-5 transition ${
                dragging
                  ? "bg-indigo-50 border-indigo-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Upload File (PDF / TXT)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag & drop your file here or choose manually.
                  </p>
                </div>

                <span className="text-xs font-bold text-gray-600 bg-white border px-3 py-1 rounded-full">
                  {fileMeta ? "1 file selected" : "No file"}
                </span>
              </div>

              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => handleFilePick(e.target.files?.[0] || null)}
                className="w-full mt-3 text-sm"
              />

              {fileMeta && (
                <div className="mt-4 bg-white border rounded-xl p-3 flex items-start justify-between gap-3">
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

              <p className="text-xs text-gray-500 mt-3">
                Your submission will be checked for similarity with other
                submissions.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full font-semibold py-3 rounded-xl transition ${
                isSubmitDisabled
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
            <div className={`mt-5 p-4 rounded-2xl border ${risk?.box || ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Similarity Score:{" "}
                    <span className="font-extrabold">
                      {result.similarityScore}%
                    </span>
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    Status:{" "}
                    <span className="font-bold">
                      {risk?.label || "Unknown"}
                    </span>
                  </p>
                </div>

                {/* mini bar */}
                <div className="w-28">
                  <div className="h-2 w-full bg-white/70 rounded-full overflow-hidden border">
                    <div
                      className={`h-full ${risk?.bar || "bg-gray-400"}`}
                      style={{
                        width: `${Math.min(result.similarityScore, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {result?.filePath && (
                <div className="mt-3">
                  <a
                    href={result.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-700 font-semibold underline"
                  >
                    📄 View your submitted file
                  </a>
                </div>
              )}

              {result?.explanation?.explanationText && (
                <p className="text-sm text-gray-700 mt-3">
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
