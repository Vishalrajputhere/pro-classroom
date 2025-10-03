import React, { useState, useEffect } from 'react';

function SubmissionList({ assignmentId, onBack }) {
    const [submissions, setSubmissions] = useState([]);
    const [assignmentDetails, setAssignmentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/assignments/submissions/${assignmentId}`, {
                    headers: { 'x-auth-token': token },
                });
                const data = await response.json();
                
                if (response.ok) {
                    setSubmissions(data);
                    
                    // CRITICAL: Extract assignment details from the first submission object
                    if (data.length > 0 && data[0].assignment) {
                        setAssignmentDetails(data[0].assignment);
                    }
                } else {
                    setError(data.msg || "Failed to fetch submissions.");
                }
            } catch (err) {
                setError("Network error fetching submissions.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [assignmentId]);

    const getScoreColor = (score) => {
        if (score >= 70) return "bg-red-200 text-red-800 border-red-500"; // High Plagiarism
        if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-500"; // Moderate Plagiarism
        return "bg-green-100 text-green-800 border-green-500"; // Low/None Plagiarism
    };

    if (loading) return <p className="text-center py-8 text-blue-500">Loading Submissions and Report...</p>;
    if (error) return <p className="text-center py-8 text-red-500 font-bold">{error}</p>;

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition duration-150 shadow-sm">
                &larr; Back to Dashboard
            </button>
            
            {/* Display Assignment Title */}
            <div className="border-b pb-4">
                <h2 className="text-4xl font-extrabold text-indigo-700">
                    {assignmentDetails ? assignmentDetails.title : 'Assignment Report'}
                </h2>
                <p className="text-gray-600 mt-1">{assignmentDetails ? assignmentDetails.description : ''}</p>
            </div>

            <h3 className="text-2xl font-bold text-gray-800">Student Submissions ({submissions.length})</h3>

            {submissions.length === 0 ? (
                <p className="p-4 bg-gray-100 rounded-lg text-gray-600">No submissions found for this assignment.</p>
            ) : (
                <ul className="space-y-4">
                    {submissions.map((sub) => (
                        <li key={sub._id} className="p-4 bg-white rounded-xl shadow-lg flex justify-between items-center border border-gray-200">
                            
                            {/* Student Info (Accessing the populated 'student' object) */}
                            <div>
                                {/* Check if student object exists before accessing properties */}
                                {sub.student ? (
                                    <>
                                        <p className="font-semibold text-lg text-gray-900">{sub.student.username}</p>
                                        <p className="text-sm text-gray-500">{sub.student.email}</p>
                                    </>
                                ) : (
                                    <p className="font-semibold text-lg text-red-500">Student Data Missing</p>
                                )}
                                <p className="text-sm text-gray-500 mt-1">Submitted on: {new Date(sub.createdAt).toLocaleDateString()}</p>
                            </div>

                            {/* Plagiarism Score */}
                            <div className={`p-4 rounded-xl font-extrabold text-2xl border-l-4 ${getScoreColor(sub.similarityScore)}`}>
                                {sub.similarityScore}%
                                <p className="text-sm font-normal pt-1">Similarity Score</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SubmissionList;