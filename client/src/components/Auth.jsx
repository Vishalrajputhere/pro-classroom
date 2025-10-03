import { useState } from 'react';

function Auth() {
    // State for managing form inputs
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const { username, email, password, role } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
        let dataToSend = isLogin ? { email, password } : { username, email, password, role };

        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    localStorage.setItem('token', data.token);
                    setSuccessMsg('Login successful! Redirecting...');
                    window.location.reload(); 
                } else {
                    setSuccessMsg('Registration successful! Please log in.');
                    setIsLogin(true);
                }
            } else {
                setError(data.msg || 'An unknown error occurred.');
            }
        } catch (err) {
            setError('Could not connect to the server. Check if the backend is running.'+err);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            
            {successMsg && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    {successMsg}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={onChange}
                            required
                            // FIX: Added text-gray-900 to ensure dark text visibility
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        // FIX: Added text-gray-900
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                        // FIX: Added text-gray-900
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                </div>
                {!isLogin && (
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            id="role"
                            name="role"
                            value={role}
                            onChange={onChange}
                            // FIX: Added text-gray-900
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                )}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>
            <p
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null); 
                    setSuccessMsg(null);
                }}
                className="mt-6 text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
            >
                {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </p>
        </div>
    );
}

export default Auth;