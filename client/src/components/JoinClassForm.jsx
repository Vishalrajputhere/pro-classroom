import React, { useState } from 'react';

function JoinClassForm({ onClassJoined }) {
    const [classCode, setClassCode] = useState('');
    const [status, setStatus] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus('Joining...');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/classes/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token, 
                },
                body: JSON.stringify({ classCode }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus(`Success! Joined ${data.class.name}.`);
                setClassCode('');
                onClassJoined(data.class); // Tell the dashboard to refresh
            } else {
                setStatus(`Error: ${data.msg || 'Could not join class.'}`);
            }

        } catch (error) {
            setStatus('Network error. Check server status.');
        }
    };

    return (
        <div className="p-6 bg-indigo-50 border border-indigo-300 rounded-xl shadow-inner mb-6">
            <h3 className="text-xl font-bold mb-4 text-indigo-700">Join a New Class</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter Class Code
                    </label>
                    <input
                        type="text"
                        id="classCode"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                        placeholder="E.g., D3J6F2"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
                    disabled={status.includes('Joining')}
                >
                    Join Class
                </button>
            </form>
            {status && (
                <p className={`mt-4 text-sm font-medium ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {status}
                </p>
            )}
        </div>
    );
}

export default JoinClassForm;