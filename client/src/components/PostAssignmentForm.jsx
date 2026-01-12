import { useState } from "react";
import { apiFetch } from "../api/api";

function PostAssignmentForm({ classId, onAssignmentPosted }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [teacherFile, setTeacherFile] = useState(null);
  const [status, setStatus] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("Posting...");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("classId", classId);

    // 🔥 THIS MUST MATCH multer.single("teacherFile")
    if (teacherFile) {
      formData.append("teacherFile", teacherFile);
    }

    try {
      await apiFetch("/api/assignments/post", {
        method: "POST",
        body: formData, // ❌ DO NOT SET HEADERS
      });

      setStatus("Assignment posted");
      setTitle("");
      setDescription("");
      setDueDate("");
      setTeacherFile(null);

      onAssignmentPosted();
    } catch (err) {
      console.error(err);
      setStatus("Failed to post assignment");
    }
  };

  return (
    <div className="bg-yellow-50 border p-6 rounded-xl">
      <h3 className="text-xl font-bold mb-4">Post Assignment</h3>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setTeacherFile(e.target.files[0])}
        />

        <button className="bg-indigo-600 text-white px-4 py-2 rounded">
          Post
        </button>
      </form>

      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}

export default PostAssignmentForm;
