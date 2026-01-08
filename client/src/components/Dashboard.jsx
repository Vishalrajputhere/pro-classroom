import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import Navbar from "./Navbar";
import CreateClassForm from "./CreateClassForm";
import JoinClassForm from "./JoinClassForm";
import TeacherClassDetail from "./TeacherClassDetail";
import ClassDetail from "./ClassDetail";
import SubmissionList from "./SubmissionList";
import Skeleton from "./Skeleton";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [teacherClasses, setTeacherClasses] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // 🔐 Load logged-in user (backend = source of truth)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiFetch("/api/users/me");
        setUser(userData);

        setSelectedClass(null);
        setSelectedAssignmentId(null);

        if (userData.role === "teacher") {
          const data = await apiFetch("/api/classes/teacher");
          setTeacherClasses(data);
        } else {
          const data = await apiFetch("/api/classes/student");
          setStudentClasses(data);
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

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* ================= TEACHER VIEW ================= */}
        {user.role === "teacher" && (
          <>
            {!selectedClass && !selectedAssignmentId && (
              <>
                <CreateClassForm
                  onClassCreated={() => setRefreshTrigger(!refreshTrigger)}
                />

                <div className="mt-10">
                  <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
                    Your Classes
                  </h2>

                  {teacherClasses.length === 0 ? (
                    <p className="text-gray-600">No classes created yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {teacherClasses.map((cls) => (
                        <div
                          key={cls._id}
                          onClick={() => setSelectedClass(cls)}
                          className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border transition"
                        >
                          <h3 className="text-xl font-bold">{cls.name}</h3>
                          <p className="mt-2 text-sm text-indigo-600 font-medium">
                            Code: {cls.classCode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedClass && !selectedAssignmentId && (
              <TeacherClassDetail
                classId={selectedClass._id}
                className={selectedClass.name}
                onBack={() => setSelectedClass(null)}
                onSelectAssignment={setSelectedAssignmentId}
              />
            )}

            {selectedAssignmentId && (
              <SubmissionList
                assignmentId={selectedAssignmentId}
                onBack={() => setSelectedAssignmentId(null)}
              />
            )}
          </>
        )}

        {/* ================= STUDENT VIEW ================= */}
        {user.role === "student" && (
          <>
            <JoinClassForm
              onClassJoined={() => setRefreshTrigger(!refreshTrigger)}
            />

            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
                Your Classes
              </h2>

              {studentClasses.length === 0 ? (
                <p className="text-gray-600">You have not joined any class.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentClasses.map((cls) => (
                    <div
                      key={cls._id}
                      onClick={() => setSelectedClass(cls)}
                      className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border transition"
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
