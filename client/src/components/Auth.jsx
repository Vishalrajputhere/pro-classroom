import { useState } from "react";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { username, email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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

        // ✅ NO RELOAD LOOP
        window.location.href = "/";
      }

      // ✅ REGISTER FLOW
      else {
        setSuccess("Registration successful. Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Server not reachable.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? "Login" : "Register"}
      </h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        {!isLogin && (
          <input
            name="username"
            placeholder="Username"
            value={username}
            onChange={onChange}
            required
            className="w-full p-2 border rounded"
          />
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={onChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={onChange}
          required
          className="w-full p-2 border rounded"
        />

        {!isLogin && (
          <select
            name="role"
            value={role}
            onChange={onChange}
            className="w-full p-2 border rounded"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <p
        onClick={() => {
          setIsLogin(!isLogin);
          setError("");
          setSuccess("");
        }}
        className="text-center mt-4 text-indigo-600 cursor-pointer"
      >
        {isLogin ? "Create account" : "Already have an account?"}
      </p>
    </div>
  );
}

export default Auth;
