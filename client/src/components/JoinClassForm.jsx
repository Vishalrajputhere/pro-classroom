import React, { useState } from "react";

function JoinClassForm({ onClassJoined }) {
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ classCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Joined class: ${data.class.name}`);
        setClassCode("");
        onClassJoined(data.class); // refresh dashboard
      } else {
        setError(data.msg || "Could not join class.");
      }
    } catch (err) {
      setError("Network error. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition bg-white";

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl font-extrabold text-gray-900">
          Join a New Class ✨
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter the class code provided by your teacher.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="classCode"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Class Code
          </label>

          <input
            type="text"
            id="classCode"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder="E.g. D3J6F2"
            required
            className={inputClass}
          />

          <p className="text-xs text-gray-500 mt-2">
            Tip: Class codes are usually 5–8 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition"
        >
          {loading ? "Joining..." : "Join Class"}
        </button>
      </form>
    </div>
  );
}

export default JoinClassForm;
