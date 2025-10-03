import React, { useState, useEffect } from 'react';

function PostAssignmentForm({ teacherClasses, onAssignmentPosted }){
    const [formData, setFormData] = useState({
        classId: '',
        title: '',
        description: '',
        dueDate: '',
        teacherFile: null 
    });
    const [status, setStatus] = useState('');

    const onChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus('Posting assignment...');

        const dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('description', formData.description);
        dataToSend.append('dueDate', formData.dueDate);
        dataToSend.append('classId', formData.classId);
        
        if (formData.teacherFile) {
            dataToSend.append('teacherFile', formData.teacherFile);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/assignments/post', {
                method: 'POST',
                headers: {
                    'x-auth-token': token, 
                },
                body: dataToSend, 
            });

            const data = await response.json();

            if (response.ok) {
    setStatus(`Success! Assignment "${data.assignment.title}" posted. Project complete!`);
    setFormData({ classId: '', title: '', description: '', dueDate: '', teacherFile: null });
    
    // --- FINAL FIX: FORCED HARD RELOAD ---
    // This bypasses the React state issue and guarantees fresh data fetch
    setTimeout(() => {
        window.location.reload(); 
    }, 500); 
    // --- END FINAL FIX ---

}  else {
                setStatus(`Error: ${data.msg || 'Could not post assignment.'}`);
            }
        } catch (error) {
            setStatus('Network error. Check server status.');
        }
    };

    const inputClasses = "w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-900 bg-white";

    return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-yellow-700">Post a New Assignment</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                
                {/* Class Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Assign to Class</label>
                    <select
                        name="classId"
                        value={formData.classId}
                        onChange={onChange}
                        required
                        className={inputClasses} // <-- UPDATED
                    >
                        <option value="">-- Select Class --</option>
                        {teacherClasses.map(cls => (
                            <option key={cls._id} value={cls._id}>{cls.name} ({cls.classCode})</option>
                        ))}
                    </select>
                </div>
                
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={onChange} required className={inputClasses} /> {/* <-- UPDATED */}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={onChange} required className={inputClasses} rows="3" /> {/* <-- UPDATED */}
                </div>

                {/* Due Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={onChange} required className={inputClasses} /> {/* <-- UPDATED */}
                </div>
                
                {/* Teacher File (Instructions PDF) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Instructions File (Optional PDF)</label>
                    <input type="file" name="teacherFile" onChange={onChange} accept=".pdf" className="w-full mt-1" />
                </div>

                <button type="submit" disabled={status.includes('Posting')} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-md transition duration-150">
                    {status.includes('Posting') ? 'Posting...' : 'Post Assignment'}
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

export default PostAssignmentForm;