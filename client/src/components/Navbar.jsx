function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Pro Classroom</h1>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm capitalize">{user.role}</span>
          <button
            onClick={onLogout}
            className="bg-white text-indigo-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
