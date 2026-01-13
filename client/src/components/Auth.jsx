import { useState } from "react";

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { username, email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const endpoint = isLogin ? "/api/users/login" : "/api/users/register";
    const payload = isLogin
      ? { email, password }
      : { username, email, password, role };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("AUTH RESPONSE:", data);

      if (!response.ok) {
        setError(data.msg || "Authentication failed");
        return;
      }

      // ✅ LOGIN FLOW
      if (isLogin) {
        if (!data.token) {
          setError("Token missing from server response");
          return;
        }

        localStorage.setItem("token", data.token);

        const verify = localStorage.getItem("token");
        console.log("TOKEN SAVED:", verify);

        if (!verify) {
          setError("Failed to store token");
          return;
        }

        // ✅ Tell App.jsx to refresh auth state (NO reload)
        if (typeof onAuthSuccess === "function") {
          onAuthSuccess();
        }

        setSuccess("Login successful ✅");
      }

      // ✅ REGISTER FLOW
      else {
        setSuccess("Registration successful. Please login.");
        setIsLogin(true);
        setFormData({
          username: "",
          email: "",
          password: "",
          role: "student",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Server not reachable.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition bg-white";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? "Welcome Back 👋" : "Create Your Account ✨"}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin
              ? "Login to continue to your classroom dashboard."
              : "Register as a student or teacher to get started."}
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
            ✅ {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Username
              </label>
              <input
                name="username"
                placeholder="Enter username"
                value={username}
                onChange={onChange}
                required
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={onChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={onChange}
                required
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 hover:underline"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Select Role
              </label>
              <select
                name="role"
                value={role}
                onChange={onChange}
                className={inputClass}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>

              <p className="text-xs text-gray-500 mt-2">
                Teacher can post assignments, student can submit.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            className="text-indigo-600 font-semibold hover:underline"
          >
            {isLogin ? "Create account" : "Already have an account?"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
