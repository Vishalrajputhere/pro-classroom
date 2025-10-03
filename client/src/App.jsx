import { useState, useEffect } from 'react';
import './index.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  // State to track if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for the token in Local Storage when the app loads
    const token = localStorage.getItem('token');
    
    if (token) {
      // In a production app, you would verify this token with the backend.
      // For development, checking for its existence is sufficient to switch the view.
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []); // Runs only once when the app mounts

  return (
    // Sets the global background and centering with Tailwind
    <div className="min-h-screen min-w-screen bg-gray-100 flex items-center justify-center">
      {/* Conditional Rendering: Show Dashboard if logged in, otherwise show Auth forms */}
      {isAuthenticated ? <Dashboard /> : <Auth />}
    </div>
  );
}

export default App;