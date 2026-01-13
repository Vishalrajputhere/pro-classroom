import { useState } from "react";

function CreateClassForm({ onClassCreated }) {
  const [className, setClassName] = useState("");

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
      if (!token) {
        setError("User not logged in.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/classes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ name: className }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Class created! Code: ${data.class.classCode}`);
        setClassName("");
        onClassCreated(data.class);
      } else {
        setError(data.msg || "Could not create class.");
      }
    } catch (err) {
      setError("Network error. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition bg-white";

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl font-extrabold text-gray-900">
          Create a New Class 📚
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Give your class a name. Students will join using the generated code.
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
            htmlFor="className"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Class Name
          </label>

          <input
            type="text"
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. Advanced JavaScript"
            required
            className={inputClass}
          />

          <p className="text-xs text-gray-500 mt-2">
            Example: “Java”, “DBMS Lab”, “OOSE”, “Python for Data Science”
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition"
        >
          {loading ? "Creating..." : "Create Class"}
        </button>
      </form>
    </div>
  );
}

export default CreateClassForm;
