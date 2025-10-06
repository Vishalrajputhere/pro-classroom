import React, { useState, useEffect } from 'react';
import StudentSubmissionForm from './StudentSubmissionForm';

function ClassDetail({ classId, className, onBack }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/assignments/class/${classId}`, {
                    headers: { 'x-auth-token': token },
                });
                const data = await response.json();

                if (response.ok) {
                    setAssignments(data);
                } else {
                    setError(data.msg || "Failed to fetch assignments.");
                }
            } catch (err) {
                setError("Network error fetching assignments.");
            } finally {
                setLoading(false);
            }
        };

        if (classId) {
            fetchAssignments();
        }
    }, [classId]);

    return (
        <div className="space-y-6 p-8 bg-white rounded-xl shadow-lg border border-indigo-200">
            <button 
                onClick={onBack} 
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition duration-150 font-semibold mb-4"
            >
                &larr; Back to All Classes
            </button>

            <h2 className="text-4xl font-extrabold text-indigo-700 border-b pb-3">
                {className} Assignments
            </h2>

            {loading && <p className="text-center py-6 text-indigo-500">Loading Assignments...</p>}
            {error && <p className="text-center py-6 text-red-500 font-bold">{error}</p>}
            
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignments.length > 0 ? (
                        assignments.map((assignment) => (
                            <div key={assignment._id} className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                                <h3 className="text-xl font-bold text-blue-700 mb-2">{assignment.title}</h3>
                                <p className="text-gray-600 mb-3">{assignment.description}</p>
                                <p className="text-sm text-gray-500 mb-4">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                
                                {/* Submission Form */}
                                <StudentSubmissionForm assignmentId={assignment._id} /> 
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 p-4 bg-yellow-50 rounded-lg">No assignments posted for this class yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default ClassDetail;