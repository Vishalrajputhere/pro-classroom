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

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const endpoint = isLogin ? "/api/users/login" : "/api/users/register";

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg);

      if (isLogin) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      } else {
        setSuccess("Registration successful. Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
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
            onChange={onChange}
            required
            className="w-full p-2 border rounded"
          />
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={onChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={onChange}
          required
          className="w-full p-2 border rounded"
        />

        {!isLogin && (
          <select
            name="role"
            onChange={onChange}
            className="w-full p-2 border rounded"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}

        <button className="w-full bg-indigo-600 text-white py-2 rounded">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <p
        onClick={() => setIsLogin(!isLogin)}
        className="text-center mt-4 text-indigo-600 cursor-pointer"
      >
        {isLogin ? "Create account" : "Already have an account?"}
      </p>
    </div>
  );
}

export default Auth;
