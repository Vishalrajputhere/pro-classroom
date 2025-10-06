import { useState, useEffect } from 'react';
import './index.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar'; 
import { jwtDecode } from 'jwt-decode';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); 

    const onLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.user.role); 
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false);
        }
    }, []); 
    
    // Determine the user's role for the Navbar display
    const navUserRole = isAuthenticated ? userRole : 'Guest';

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar is ALWAYS rendered at the top now */}
            <Navbar userRole={navUserRole} isAuthenticated={isAuthenticated} onLogout={onLogout} />
            
            {isAuthenticated ? (
                // Authenticated View: Show Dashboard
                <div className="py-8 w-full min-h-screen"> 
                    <Dashboard userRole={userRole} /> 
                </div>
            ) : (
                // Unauthenticated View: Show Full-Screen Auth Layout
                <div className="flex items-center justify-center w-full min-h-[calc(100vh-64px)]">
                    <Auth />
                </div>
            )}
        </div>
    );
}

export default App;