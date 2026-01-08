import React, { useState } from "react";
import { apiFetch } from "./api/api";

function PostAssignmentForm({ teacherClasses, onAssignmentPosted }) {
  const [formData, setFormData] = useState({
    classId: "",
    title: "",
    description: "",
    dueDate: "",
    teacherFile: null,
  });

  const [status, setStatus] = useState("");

  const onChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("Posting assignment...");

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("description", formData.description);
    dataToSend.append("dueDate", formData.dueDate);
    dataToSend.append("classId", formData.classId);

    if (formData.teacherFile) {
      dataToSend.append("teacherFile", formData.teacherFile);
    }

    try {
      await apiFetch("/api/assignments/post", {
        method: "POST",
        body: dataToSend,
      });

      setStatus("Assignment posted successfully!");

      setFormData({
        classId: "",
        title: "",
        description: "",
        dueDate: "",
        teacherFile: null,
      });

      // ✅ PROPER DATA REFRESH
      if (onAssignmentPosted) {
        onAssignmentPosted();
      }
    } catch (err) {
      setStatus(err.message || "Failed to post assignment.");
    }
  };

  const inputClasses =
    "w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-900 bg-white";

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-yellow-700">
        Post a New Assignment
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Class Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assign to Class
          </label>
          <select
            name="classId"
            value={formData.classId}
            onChange={onChange}
            required
            className={inputClasses}
          >
            <option value="">-- Select Class --</option>
            {teacherClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.classCode})
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            required
            className={inputClasses}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            required
            rows="3"
            className={inputClasses}
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={onChange}
            required
            className={inputClasses}
          />
        </div>

        {/* Teacher File */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Instructions File (Optional PDF)
          </label>
          <input
            type="file"
            name="teacherFile"
            onChange={onChange}
            accept=".pdf"
            className="w-full mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={status.includes("Posting")}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-md transition duration-150"
        >
          {status.includes("Posting") ? "Posting..." : "Post Assignment"}
        </button>
      </form>

      {status && (
        <p
          className={`mt-4 text-sm font-medium ${
            status.toLowerCase().includes("fail") ||
            status.toLowerCase().includes("error")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default PostAssignmentForm;
