import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

function Auth() {
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
                setError(data.msg || 'Authentication failed. Check credentials.');
            }
        } catch (err) {
            setError('Network error. Check server status.');
        }
    };

    const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white";

    return (
        // The main layout wrapper: full screen minus navbar height
        <div className="grid grid-cols-1 md:grid-cols-12 w-11/12 max-w-6xl mx-auto my-12 bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[70vh]">
            
            {/* Left Column: Image/Branding (Modern Look) */}
            <div className="hidden md:flex md:col-span-7 bg-indigo-700 items-center justify-center p-12">
                <div className="text-center space-y-6">
                    <h1 className="text-5xl font-extrabold text-white">
                        Pro Classroom
                    </h1>
                    <p className="text-indigo-200 text-xl font-light">
                        The ultimate platform for secure assignment submission and plagiarism detection.
                    </p>
                    <div className="w-full">
                        {/* Placeholder for a relevant image/SVG */}
                         
                    </div>
                </div>
            </div>

            {/* Right Column: Sign In Form */}
            <div className="col-span-12 md:col-span-5 flex flex-col justify-center p-8 sm:p-12">
                <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                
                {/* Error/Success Messages */}
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

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Username Field (Register Only) */}
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input type="text" name="username" value={username} onChange={onChange} required className={inputClasses} />
                        </div>
                    )}
                    
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" value={email} onChange={onChange} required className={inputClasses} />
                    </div>
                    
                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} required className={inputClasses} />
                    </div>
                    
                    {/* Role Selection (Register Only) */}
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select name="role" value={role} onChange={onChange} className={inputClasses}>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition duration-150 shadow-md"
                    >
                        {isLogin ? 'Log In' : 'Create Account'}
                    </button>
                </form>

                <p
                    onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }}
                    className="mt-6 text-center text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium"
                >
                    {isLogin ? 'Need an account? Register Here' : 'Already have an account? Log In'}
                </p>
            </div>
        </div>
    );
}

export default Auth;