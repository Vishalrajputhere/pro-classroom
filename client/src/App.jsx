import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import { jwtDecode } from "jwt-decode";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // 🔐 Read token ONCE on app load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // ✅ Token exists & valid
      setIsAuthenticated(true);
      setUser({
        id: decoded.user.id,
        role: decoded.user.role,
      });
    } catch (err) {
      // ❌ Invalid token → remove once
      console.error("Invalid token");
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar ALWAYS visible */}
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="pt-6">
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <div className="flex justify-center">
            <Auth />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
