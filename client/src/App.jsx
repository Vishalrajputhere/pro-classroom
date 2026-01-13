import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import { jwtDecode } from "jwt-decode";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const syncAuthFromToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // ✅ Optional: auto-expire check
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      setIsAuthenticated(true);
      setUser({
        id: decoded.user.id,
        role: decoded.user.role,
      });
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // 🔐 Read token on app load
  useEffect(() => {
    syncAuthFromToken();
    setCheckingAuth(false);

    // ✅ If token changes in another tab, update UI
    const handleStorage = (e) => {
      if (e.key === "token") {
        syncAuthFromToken();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  // ✅ Called after login success (no reload needed)
  const handleAuthSuccess = () => {
    syncAuthFromToken();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 font-medium">Checking login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar ALWAYS visible */}
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isAuthenticated ? (
          <Dashboard />
        ) : (
          <div className="flex justify-center">
            <Auth onAuthSuccess={handleAuthSuccess} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
