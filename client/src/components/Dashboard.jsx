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
