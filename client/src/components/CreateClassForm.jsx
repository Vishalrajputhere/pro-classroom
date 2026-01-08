import { useState } from 'react';

function CreateClassForm({ onClassCreated }) {
    const [className, setClassName] = useState('');
    const [status, setStatus] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus('Creating class...');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setStatus('Error: User not logged in.');
                return;
            }

            const response = await fetch('http://localhost:5000/api/classes/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token, 
                },
                body: JSON.stringify({ name: className }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus(`Success! Class code: ${data.class.classCode}`);
                setClassName('');
                onClassCreated(data.class);
            } else {
                setStatus(`Error: ${data.msg || 'Could not create class.'}`);
            }

        } catch (error) {
            setStatus('Network error. Check server status.');
        }
    };

    return (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">Create a New Class</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                        Class Name
                    </label>
                    <input
                        type="text"
                        id="className"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="e.g., Advanced JavaScript"
                        required
                        // UPDATED CLASS: Added text-gray-900 bg-white
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-md"
                    disabled={status === 'Creating class...'}
                >
                    Create Class
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

export default CreateClassForm;