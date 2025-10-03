import React, { useState } from 'react';

function StudentSubmissionForm({ assignmentId }) {
    const [submissionFile, setSubmissionFile] = useState(null);
    const [status, setStatus] = useState('');
    const [similarityScore, setSimilarityScore] = useState(null);

    const onFileChange = (e) => {
        // Get the file from the input field
        setSubmissionFile(e.target.files[0]);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus('Submitting assignment...');
        setSimilarityScore(null);

        // 1. Package data for Multer (form-data)
        const dataToSend = new FormData();
        dataToSend.append('assignmentId', assignmentId);
        
        if (submissionFile) {
            // The key must match the name expected by Multer: 'submissionFile'
            dataToSend.append('submissionFile', submissionFile);
        } else {
            setStatus('Error: Please select a file to submit.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/assignments/submit', {
                method: 'POST',
                headers: {
                    'x-auth-token': token, // Send the student's token
                },
                body: dataToSend, 
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('Submission successful!');
                setSimilarityScore(data.submission.similarityScore);
                setSubmissionFile(null);
            } else {
                setStatus(`Error: ${data.msg || 'Submission failed. Check file type.'}`);
            }
        } catch (error) {
            setStatus('Network error. Could not connect to server.');
        }
    };

    return (
        <div className="p-6 bg-green-50 border border-green-300 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4 text-green-700 border-b pb-2">Submit Your Work</h3>
            <form onSubmit={onSubmit} className="space-y-4">
                
                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select File (.txt only for now)</label>
                    <input 
                        type="file" 
                        onChange={onFileChange} 
                        // We are keeping .pdf here, but remind the user TXT works reliably.
                        accept=".pdf, .txt" 
                        required 
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition duration-150"
                    disabled={status.includes('Submitting')}
                >
                    Submit Assignment
                </button>
            </form>
            
            {status && (
                <p className={`mt-4 text-sm font-medium ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {status}
                </p>
            )}

            {similarityScore !== null && (
                <div className={`mt-4 p-3 font-extrabold rounded-md ${similarityScore > 50 ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                    Plagiarism Score: {similarityScore}%
                    <p className="font-normal text-sm pt-1">This is the highest score found against all prior submissions.</p>
                </div>
            )}
        </div>
    );
}

export default StudentSubmissionForm;