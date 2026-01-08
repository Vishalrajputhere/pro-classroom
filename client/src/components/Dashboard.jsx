<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import Navbar from "./Navbar";
import CreateClassForm from "./CreateClassForm";
import JoinClassForm from "./JoinClassForm";
import TeacherClassDetail from "./TeacherClassDetail";
import ClassDetail from "./ClassDetail";
import SubmissionList from "./SubmissionList";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [teacherClasses, setTeacherClasses] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // 🔐 Load logged-in user (BACKEND = source of truth)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiFetch("/api/users/me");
        setUser(userData);

        // Reset stale UI state on refresh
        setSelectedClass(null);
        setSelectedAssignmentId(null);

        if (userData.role === "teacher") {
          await fetchTeacherClasses();
        } else {
          await fetchStudentClasses();
        }
      } catch (err) {
        localStorage.removeItem("token");
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [refreshTrigger]);

  // 👩‍🏫 Fetch teacher classes
  const fetchTeacherClasses = async () => {
    const data = await apiFetch("/api/classes/teacher");
    setTeacherClasses(data);
  };

  // 👨‍🎓 Fetch student classes
  const fetchStudentClasses = async () => {
    const data = await apiFetch("/api/classes/student");
    setStudentClasses(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Skeleton height={40} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="p-6 max-w-7xl mx-auto">
        {/* ================= TEACHER VIEW ================= */}
        {user?.role === "teacher" && (
          <>
            {/* Teacher class list */}
            {!selectedClass && !selectedAssignmentId && (
              <>
                <CreateClassForm
                  onClassCreated={() => setRefreshTrigger(!refreshTrigger)}
                />

                <div className="mt-8">
                  <h2 className="text-3xl font-bold mb-4">Your Classes</h2>

                  {teacherClasses.length === 0 ? (
                    <p className="text-gray-600">No classes created yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {teacherClasses.map((cls) => (
                        <div
                          key={cls._id}
                          onClick={() => setSelectedClass(cls)}
                          className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg border"
                        >
                          <h3 className="text-xl font-bold">{cls.name}</h3>
                          <p className="text-sm text-gray-500">
                            Code: {cls.classCode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Teacher → assignments of selected class */}
            {selectedClass && !selectedAssignmentId && (
              <TeacherClassDetail
                classId={selectedClass._id}
                className={selectedClass.name}
                onBack={() => {
                  setSelectedAssignmentId(null);
                  setSelectedClass(null);
                }}
                onSelectAssignment={setSelectedAssignmentId}
              />
            )}

            {/* Teacher → plagiarism report */}
            {selectedAssignmentId && (
              <SubmissionList
                assignmentId={selectedAssignmentId}
                onBack={() => setSelectedAssignmentId(null)}
              />
            )}
          </>
        )}

        {/* ================= STUDENT VIEW ================= */}
        {user?.role === "student" && (
          <>
            <JoinClassForm
              onClassJoined={() => setRefreshTrigger(!refreshTrigger)}
            />

            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-4">Your Classes</h2>

              {studentClasses.length === 0 ? (
                <p className="text-gray-600">You have not joined any class.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {studentClasses.map((cls) => (
                    <div
                      key={cls._id}
                      onClick={() => setSelectedClass(cls)}
                      className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg border"
                    >
                      <h3 className="text-xl font-bold">{cls.name}</h3>
                      <p className="text-sm text-gray-500">
                        Teacher: {cls.teacher.username}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student → class detail */}
            {selectedClass && (
              <ClassDetail
                classId={selectedClass._id}
                className={selectedClass.name}
                onBack={() => setSelectedClass(null)}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
=======
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import CreateClassForm from './CreateClassForm';
import PostAssignmentForm from './PostAssignmentForm';
import StudentSubmissionForm from './StudentSubmissionForm';
import SubmissionList from './SubmissionList';
import JoinClassForm from './JoinClassForm'; 
import ClassDetail from './ClassDetail';
import TeacherClassDetail from './TeacherClassDetail';


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
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedTeacherClass, setSelectedTeacherClass] = useState(null);

     // --- Action Handler: Triggers a complete data refresh ---
    const handleDataChange = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // --- Utility Functions for API Calls (Unchanged, for brevity) ---
    const fetchTeacherClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/classes/teacher`, {
                headers: { 'x-auth-token': token },
            });
            if (response.ok) {
                const data = await response.json();
                setTeacherClasses(data);
            }
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        }
    };

    const fetchTeacherAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/assignments/teacher/all`, {
                headers: { 'x-auth-token': token },
            });
            if (response.ok) {
                const data = await response.json();
                setTeacherAssignments(data);
            }
        } catch (error) {
            console.error("Failed to fetch assignments:", error);
        }
    };
    
    // ... (fetchStudentData, onLogout functions are the same)
    const onLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const fetchStudentData = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        // 1. Fetch enrolled classes
        const enrolledClassesRes = await fetch(`http://localhost:5000/api/classes/student`, { headers });
        
        if (!enrolledClassesRes.ok) throw new Error("Failed to fetch enrolled classes.");
        
        const enrolledClasses = await enrolledClassesRes.json();
        setStudentEnrolledClasses(enrolledClasses);

        // 2. Prepare all assignment fetches
        const assignmentFetches = enrolledClasses.map(cls => 
            fetch(`http://localhost:5000/api/assignments/class/${cls._id}`, { headers })
        );

        // 3. CRITICAL FIX: Use Promise.allSettled to ensure we process results 
        // even if one assignment fetch fails (prevents indefinite loading).
        const assignmentsResponses = await Promise.allSettled(assignmentFetches);
        
        // 4. Process all assignment data into one array
        let allAssignments = [];
        for (const result of assignmentsResponses) {
            if (result.status === 'fulfilled' && result.value.ok) {
                const data = await result.value.json();
                allAssignments = allAssignments.concat(data);
            }
        }

        // Update the assignments state
        setStudentAssignments(allAssignments);

    } catch (error) {
        // Log the error but continue to finally block
        console.error("Failed to fetch student data:", error);
    } finally {
        // GUARANTEE the loading spinner is hidden
        setLoading(false); 
    }
};


    // --- Core Data Fetch Logic (Runs on Mount & Refresh Trigger) ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.user.role); 
                setUserId(decoded.user.id);
                
                if (decoded.user.role === 'teacher') {
                    // TEACHER LOGIC: Fetches classes and assignments
                    Promise.all([fetchTeacherClasses(), fetchTeacherAssignments()]).finally(() => setLoading(false));
                } else {
                    // STUDENT LOGIC: CRITICAL FIX - Call fetchStudentData and set loading to false
                    fetchStudentData(decoded.user.id).finally(() => setLoading(false));
                }
            } catch (error) {
                // Catches token decoding errors
                localStorage.removeItem('token');
                window.location.reload();
            }
        } else {
            setLoading(false);
        }
    }, [refreshTrigger]); 


    // --- Helper Functions for UI ---
    const getSubmissionColor = (count) => {
        if (count > 0) return "text-green-600 bg-green-100";
        return "text-gray-600 bg-gray-200";
    };


    // --- Render Logic ---

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-blue-600">Loading Dashboard...</p>
            </div>
        );
    }

    // --- TEACHER VIEW ---
    if (userRole === 'teacher') {
        
        // 1. Assignment Submission Report View (Highest Priority)
        if (selectedAssignmentId) {
            return (
                <div className="max-w-7xl mx-auto py-4">
                    <SubmissionList 
                        assignmentId={selectedAssignmentId} 
                        // Back button returns to the class detail view
                        onBack={() => setSelectedAssignmentId(null)} 
                    />
                </div>
            );
        }

        // 2. Class Detail View (Assignments List for one class)
        if (selectedTeacherClass) {
            return (
                <div className="max-w-7xl mx-auto py-4">
                    <TeacherClassDetail 
                        classId={selectedTeacherClass._id}
                        className={selectedTeacherClass.name}
                        // Back button returns to the main class list view
                        onBack={() => setSelectedTeacherClass(null)} 
                        // Clicking an assignment sets the final submission report view
                        onSelectAssignment={setSelectedAssignmentId}
                    />
                </div>
            );
        }

        // 3. Main Teacher Dashboard (Class List Landing Page)
        return (
            <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow-2xl border border-indigo-100 space-y-10">
                <h1 className="text-4xl font-extrabold text-gray-800 border-b pb-3">
                    Your Classes
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    
                    {/* Left Column: Forms (3/12 width) */}
                    <div className="md:col-span-3 space-y-6">
                        <PostAssignmentForm teacherClasses={teacherClasses} onAssignmentPosted={handleDataChange} /> 
                        <CreateClassForm onClassCreated={handleDataChange} />

                        {/* Enhanced Class Quick-View (Unclickable, but useful info) */}
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow-md">
                            <h3 className="font-bold text-indigo-700 mb-2 border-b pb-1">
                                Info Panel
                            </h3>
                            <p className="text-sm">Total Classes: {teacherClasses.length}</p>
                            <p className="text-sm">Total Assignments: {teacherAssignments.length}</p>
                        </div>
                    </div>
                    
                    {/* Right Column: Class Card List (9/12 width) */}
                    <div className="md:col-span-9 p-6 bg-gray-50 rounded-xl shadow-inner">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                            Class Administration ({teacherClasses.length})
                        </h2>
                        
                        {teacherClasses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teacherClasses.map((cls) => (
                                    // Teacher Class Card
                                    <div 
                                        key={cls._id} 
                                        onClick={() => setSelectedTeacherClass(cls)} // <-- Navigation on click
                                        className="bg-indigo-600 text-white p-6 rounded-xl shadow-xl cursor-pointer hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                                    >
                                        <h3 className="text-2xl font-bold truncate">{cls.name}</h3>
                                        <p className="text-indigo-200 mt-2">
                                            Students Enrolled: {cls.students ? cls.students.length : 'N/A'}
                                        </p>
                                        <div className="mt-4 pt-3 border-t border-indigo-400">
                                            <span className="font-mono bg-indigo-500 text-sm py-1 px-2 rounded">
                                                Code: {cls.classCode}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 p-4 bg-yellow-100 rounded-lg">No classes created yet. Use the form on the left!</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- STUDENT VIEW (DYNAMIC) ---
    if (userRole === 'student') {

        // 1. Class Detail View (If a class card is clicked)
        if (selectedClass) {
            return (
                <div className="max-w-7xl mx-auto py-4">
                    <ClassDetail 
                        classId={selectedClass._id}
                        className={selectedClass.name}
                        onBack={() => setSelectedClass(null)} 
                    />
                    <button onClick={onLogout} className="mt-8 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-md">
                        Logout
                    </button>
                </div>
            );
        }
        
        // 2. Class List View (The main landing page)
        return (
            <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow-2xl border border-green-100 space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-800 border-b pb-2">
                    Your Classes
                </h1>
                
                <div className="space-y-6">
                    <JoinClassForm onClassJoined={handleDataChange} />
                </div>

                <h2 className="text-2xl font-bold border-b pb-2">Enrolled Classes ({studentEnrolledClasses.length})</h2>

                {studentEnrolledClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {studentEnrolledClasses.map(cls => (
                            // Class Card UI
                            <div 
                                key={cls._id} 
                                onClick={() => setSelectedClass(cls)} // <-- Navigation on click
                                className="bg-indigo-600 text-white p-6 rounded-xl shadow-xl cursor-pointer hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                            >
                                <h3 className="text-2xl font-bold truncate">{cls.name}</h3>
                                <p className="text-indigo-200 mt-1">Assignments: {studentAssignments.filter(a => a.class === cls._id).length}</p>
                                <div className="mt-4 pt-3 border-t border-indigo-400">
                                    <span className="font-mono bg-indigo-500 text-sm py-1 px-2 rounded">
                                        Code: {cls.classCode}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 p-4 bg-yellow-50 rounded-lg">
                        You are not enrolled in any classes yet. Use the Join Class form above!
                    </p>
                )}

                <button onClick={onLogout} className="mt-8 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-md">
                    Logout
                </button>
            </div>
        );
    }
    
    // Fallback/Default return
    return null;
}

export default Dashboard;
>>>>>>> 073f7c55b2eb5c86d7b785dc51a71b800e35acf3
