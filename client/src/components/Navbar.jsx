function Navbar({ isAuthenticated, user, onLogout }) {
  const roleLabel = user?.role ? user.role.toUpperCase() : "";

  const roleBadge =
    user?.role === "teacher"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-green-100 text-green-800 border-green-200";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white">
            P
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Pro Classroom
          </h1>
        </div>

        {/* Right Side */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <span
              className={`hidden sm:inline-flex px-3 py-1 text-xs font-bold rounded-full border ${roleBadge}`}
            >
              {roleLabel}
            </span>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 font-medium">Not logged in</p>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
