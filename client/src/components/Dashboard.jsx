import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import CreateClassForm from './CreateClassForm';
import PostAssignmentForm from './PostAssignmentForm';
import StudentSubmissionForm from './StudentSubmissionForm';
import SubmissionList from './SubmissionList';
import JoinClassForm from './JoinClassForm'; 

function Dashboard() {
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [teacherAssignments, setTeacherAssignments] = useState([]);
    const [studentEnrolledClasses, setStudentEnrolledClasses] = useState([]);
    const [studentAssignments, setStudentAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null); 

    // --- Action Handler: Triggers a complete data refresh ---
    // This is the function passed down to the forms
    const handleDataChange = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // --- MASTER DATA FETCH FUNCTION (Defined inside the component for strict dependency) ---
    const fetchAllData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUserRole(decoded.user.role); 
            setUserId(decoded.user.id);
            
            // --- Teacher Data Fetch ---
            if (decoded.user.role === 'teacher') {
                const [classesRes, assignmentsRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/classes/teacher`, { headers: { 'x-auth-token': token } }),
                    fetch(`http://localhost:5000/api/assignments/teacher/all`, { headers: { 'x-auth-token': token } })
                ]);

                if (classesRes.ok) setTeacherClasses(await classesRes.json());
                if (assignmentsRes.ok) setTeacherAssignments(await assignmentsRes.json());
            } 
            // --- Student Data Fetch ---
            else {
                const enrolledClassesRes = await fetch(`http://localhost:5000/api/classes/student`, { headers: { 'x-auth-token': token } });
                
                if (enrolledClassesRes.ok) {
                    const enrolledClasses = await enrolledClassesRes.json();
                    setStudentEnrolledClasses(enrolledClasses);

                    const assignmentFetches = enrolledClasses.map(cls => 
                        fetch(`http://localhost:5000/api/assignments/class/${cls._id}`, { headers: { 'x-auth-token': token } })
                    );
                    const assignmentsResponses = await Promise.all(assignmentFetches);
                    
                    let allAssignments = [];
                    for (const res of assignmentsResponses) {
                        if (res.ok) {
                            allAssignments = allAssignments.concat(await res.json());
                        }
                    }
                    setStudentAssignments(allAssignments);
                }
            }
        } catch (error) {
            console.error("Master data fetch failed:", error);
            // On failure (e.g. 401), force logout
            localStorage.removeItem('token');
            window.location.reload();
        } finally {
            setLoading(false);
        }
    };


    // --- Core Data Fetch Logic (Runs on Mount & Refresh Trigger) ---
    useEffect(() => {
        setLoading(true);
        fetchAllData();
    }, [refreshTrigger]); // DEPENDS ONLY ON THE TRIGGER

    // ... (onLogout and Render Logic remain the same)
    
    const onLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-blue-600">Loading Dashboard...</p>
            </div>
        );
    }

    // --- TEACHER VIEW ---
    if (userRole === 'teacher') {
        
        // 1. Detail View: Show Submissions List
        if (selectedAssignmentId) {
            return (
                <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl border border-blue-100">
                    <SubmissionList 
                        assignmentId={selectedAssignmentId} 
                        onBack={() => setSelectedAssignmentId(null)} 
                    />
                    <button onClick={onLogout} className="mt-8 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-md">
                        Logout
                    </button>
                </div>
            );
        }

        // 2. Main Teacher Dashboard
        return (
            <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl border border-blue-100">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-4 border-b pb-2">
                    Teacher Dashboard
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                    
                    {/* Left Column: Teacher Forms */}
                    <div className="md:col-span-1 space-y-8">
                        {/* PASS HANDLE DATA CHANGE HERE */}
                        <CreateClassForm onClassCreated={handleDataChange} />
                        <PostAssignmentForm teacherClasses={teacherClasses} onAssignmentPosted={handleDataChange} /> 
                    </div>
                    
                    {/* Right Column: Assignments List & Results */}
                    <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg shadow-inner">
                        <h2 className="text-2xl text-black font-bold mb-4 border-b pb-2">Assignments ({teacherAssignments.length})</h2>
                        {teacherAssignments.length > 0 ? (
                            <ul className="space-y-3">
                                {teacherAssignments.map((assignment) => (
                                    <li key={assignment._id} className="p-4 bg-white border border-gray-200 rounded-md shadow-lg flex justify-between items-center">
                                        
                                        {/* Assignment Info */}
                                        <div>
                                            <span className="font-extrabold text-lg text-gray-800">{assignment.title}</span> 
                                            <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                            <div className="text-center font-bold text-sm">
                                                <p className="text-blue-600 text-xl">{assignment.submissionCount}</p>
                                                <p className="text-gray-500">Submissions</p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button 
                                            onClick={() => setSelectedAssignmentId(assignment._id)} 
                                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-semibold transition duration-150"
                                        >
                                            View Submissions
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No assignments posted yet. Use the form on the left!</p>
                        )}
                    </div>
                </div>
                
                <button onClick={onLogout} className="mt-8 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-md">
                    Logout
                </button>
            </div>
        );
    }

    // --- STUDENT VIEW (DYNAMIC) ---
    return (
        <div className="max-w-6xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-2xl border border-green-100">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4 border-b pb-2">
                Student Dashboard
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                
                {/* Left Column: Join Class Form */}
                <div className="lg:col-span-1">
                    <JoinClassForm onClassJoined={handleDataChange} />
                    
                    {/* Display Enrolled Classes */}
                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                         <h3 className="font-semibold text-indigo-700 mb-2 border-b">Your Classes</h3>
                         {studentEnrolledClasses.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {studentEnrolledClasses.map(cls => (
                                    <li key={cls._id}>
                                        {cls.name} (<span className="font-mono text-indigo-600">{cls.classCode}</span>)
                                    </li>
                                ))}
                            </ul>
                         ) : (
                            <p className="text-sm text-gray-500">Not enrolled in any classes yet.</p>
                         )}
                    </div>
                </div>
                
                {/* Right Column: Assignments List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold border-b pb-2">Assignments (From All Joined Classes)</h2>
                    
                    {studentAssignments.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {studentAssignments.map((assignment) => (
                                <div key={assignment._id} className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                                    <h3 className="text-xl font-bold text-blue-700 mb-2">{assignment.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                    <StudentSubmissionForm assignmentId={assignment._id} /> 
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 p-4 bg-yellow-50 rounded-lg">No assignments available. Join a class using a code!</p>
                    )}
                </div>
            </div>

            <button onClick={onLogout} className="mt-8 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-md">
                Logout
            </button>
        </div>
    );
}

export default Dashboard;