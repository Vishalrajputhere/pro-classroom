import React, { useState, useEffect } from 'react';

function TeacherClassDetail({ classId, className, onBack, onSelectAssignment }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch assignments for the selected class
    useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                // Use the route to fetch assignments for a specific class
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

    const getSubmissionColor = (count) => {
        if (count > 0) return "text-green-600 bg-green-100";
        return "text-gray-600 bg-gray-200";
    };

    if (loading) return <p className="text-center py-8 text-indigo-500">Loading Assignments...</p>;
    if (error) return <p className="text-center py-8 text-red-500 font-bold">{error}</p>;

    return (
        <div className="space-y-6">
            <button 
                onClick={onBack} 
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition duration-150 font-semibold mb-4 shadow-sm"
            >
                &larr; Back to All Classes
            </button>

            <h2 className="text-3xl font-extrabold text-gray-800 border-b pb-3">
                Assignments for: <span className="text-indigo-700">{className}</span>
            </h2>

            {assignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assignment) => (
                        <div key={assignment._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between">
                            
                            {/* Assignment Info */}
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900 mb-1 truncate">{assignment.title}</h3> 
                                <p className="text-xs text-gray-500 mb-4">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => onSelectAssignment(assignment._id)} 
                                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold transition duration-150 shadow-md"
                            >
                                View Plagiarism Report
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 p-4 bg-yellow-100 rounded-lg">No assignments found for this class.</p>
            )}
        </div>
    );
}

export default TeacherClassDetail;