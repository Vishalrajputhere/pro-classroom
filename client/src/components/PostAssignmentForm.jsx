import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/api";

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getTodayDateInputValue() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function PostAssignmentForm({ classId, onAssignmentPosted }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [teacherFile, setTeacherFile] = useState(null);

  const [status, setStatus] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const minDate = useMemo(() => getTodayDateInputValue(), []);

  // 🔒 Basic limits (safe defaults)
  const MAX_FILE_MB = 10;
  const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

  const fileMeta = useMemo(() => {
    if (!teacherFile) return null;
    return {
      name: teacherFile.name,
      type: teacherFile.type || "unknown",
      size: formatFileSize(teacherFile.size),
    };
  }, [teacherFile]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (!status.includes("✅")) return;
    const t = setTimeout(() => setStatus(""), 3000);
    return () => clearTimeout(t);
  }, [status]);

  const statusStyle = useMemo(() => {
    if (!status) return "";
    if (status.includes("❌")) return "bg-red-50 border-red-200 text-red-700";
    if (status.includes("✅"))
      return "bg-green-50 border-green-200 text-green-700";
    return "bg-gray-50 border-gray-200 text-gray-700";
  }, [status]);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      dueDate.trim().length > 0 &&
      !isPosting
    );
  }, [title, description, dueDate, isPosting]);

  const validateFile = (file) => {
    if (!file) return { ok: true };

    const name = (file.name || "").toLowerCase();
    const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
    const isTxt = name.endsWith(".txt") || file.type === "text/plain";

    if (!isPdf && !isTxt) {
      return { ok: false, msg: "❌ Only PDF or TXT files are allowed." };
    }

    if (file.size > MAX_FILE_BYTES) {
      return {
        ok: false,
        msg: `❌ File too large. Max allowed is ${MAX_FILE_MB}MB.`,
      };
    }

    return { ok: true };
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isPosting) return;

    // 🔍 Validation
    if (!title.trim() || !description.trim() || !dueDate.trim()) {
      setStatus("❌ Please fill all required fields.");
      return;
    }

    // prevent past date
    if (dueDate < minDate) {
      setStatus("❌ Due date cannot be in the past.");
      return;
    }

    const fileCheck = validateFile(teacherFile);
    if (!fileCheck.ok) {
      setStatus(fileCheck.msg);
      return;
    }

    setIsPosting(true);
    setStatus("Posting...");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("dueDate", dueDate);
    formData.append("classId", classId);

    // 🔥 MUST MATCH multer.single("teacherFile")
    if (teacherFile) {
      formData.append("teacherFile", teacherFile);
    }

    try {
      await apiFetch("/api/assignments/post", {
        method: "POST",
        body: formData, // ❌ DO NOT SET HEADERS
      });

      setStatus("✅ Assignment posted successfully!");
      setTitle("");
      setDescription("");
      setDueDate("");
      setTeacherFile(null);

      if (onAssignmentPosted) onAssignmentPosted();
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to post assignment");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl font-extrabold text-yellow-800">
            Post Assignment
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Upload a PDF/TXT (optional) and set a due date for students.
          </p>
        </div>

        <div className="text-xs px-3 py-1 rounded-full bg-white border border-yellow-200 text-yellow-800 font-semibold">
          Class Scoped
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Java Assignment 1"
            className="w-full mt-1 border border-gray-300 bg-white p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write instructions for students..."
            className="w-full mt-1 border border-gray-300 bg-white p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
            rows={4}
            required
          />
        </div>

        {/* Due Date */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              Due Date <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setDueDate(minDate)}
              className="text-xs font-semibold text-indigo-700 hover:underline"
            >
              Set Today
            </button>
          </div>

          <input
            type="date"
            value={dueDate}
            min={minDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full mt-1 border border-gray-300 bg-white p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />

          <p className="text-xs text-gray-500 mt-1">
            Minimum allowed date:{" "}
            <span className="font-semibold">{minDate}</span>
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-sm font-semibold text-gray-700">
            Instructions File (Optional)
          </label>

          <div className="mt-1 bg-white border border-gray-300 rounded-xl p-3">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                const check = validateFile(selected);

                if (!check.ok) {
                  setTeacherFile(null);
                  setStatus(check.msg);
                  return;
                }

                setTeacherFile(selected);
                setStatus("");
              }}
              className="w-full text-sm"
            />

            {fileMeta && (
              <div className="mt-3 flex items-start justify-between gap-3 bg-gray-50 border rounded-xl p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    📎 {fileMeta.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Type: <span className="font-medium">{fileMeta.type}</span> •
                    Size: <span className="font-medium">{fileMeta.size}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setTeacherFile(null)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Supported: PDF, TXT (recommended PDF). Max size: {MAX_FILE_MB}MB.
          </p>
        </div>

        {/* Submit */}
        <button
          disabled={!canSubmit}
          className={`w-full px-4 py-2.5 rounded-xl font-semibold shadow-sm transition ${
            !canSubmit
              ? "bg-indigo-300 text-white cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isPosting ? "Posting..." : "Post Assignment"}
        </button>
      </form>

      {/* Status */}
      {status && (
        <div
          className={`mt-4 text-sm font-semibold border rounded-xl p-3 ${statusStyle}`}
        >
          {status}
        </div>
      )}
    </div>
  );
}

export default PostAssignmentForm;
