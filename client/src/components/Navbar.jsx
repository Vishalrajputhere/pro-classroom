import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

function Navbar({ isAuthenticated, user, onLogout }) {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const roleLabel = user?.role ? user.role.toUpperCase() : "";

  const roleBadge =
    user?.role === "teacher"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-green-100 text-green-800 border-green-200";

  // Dynamic classes for transparent landing page nav vs solid dashboard nav
  const navClasses = isLandingPage
    ? `fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" : "bg-transparent py-5"
      }`
    : "sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm py-3";

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isLandingPage && !scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
            pro<span className="text-indigo-600">Classroom</span>
          </h1>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Role Badge */}
              <span
                className={`hidden sm:inline-flex px-3 py-1 text-xs font-bold rounded-full border ${roleBadge}`}
              >
                {roleLabel}
              </span>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-semibold text-sm transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {isLandingPage ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-indigo-600 font-semibold px-4 py-2 transition-colors hidden sm:block"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/login"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 px-5 py-2 rounded-xl font-semibold text-sm transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500 font-medium">Not logged in</p>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
