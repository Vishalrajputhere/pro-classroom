import React from "react";

function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-indigo-700 shadow-lg h-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-white text-2xl font-bold tracking-wider">
              Pro Classroom
            </span>
          </div>

          {/* Right Side */}
          {user && (
            <div className="flex items-center gap-4">
              {/* Role Info */}
              <span className="text-indigo-200 text-sm">
                Logged in as{" "}
                <span className="font-semibold capitalize text-teal-300">
                  {user.role}
                </span>
              </span>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150 shadow-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
