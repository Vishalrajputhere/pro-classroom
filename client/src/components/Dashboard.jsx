import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

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

  // 🔐 Load logged-in user (SAFE — no auto logout)
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiFetch("/api/users/me");
        setUser(userData);

        if (userData.role === "teacher") {
          const classes = await apiFetch("/api/classes/teacher");
          setTeacherClasses(classes);
        } else {
          const classes = await apiFetch("/api/classes/student");
          setStudentClasses(classes);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
        // ❌ DO NOT REMOVE TOKEN
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Skeleton height={40} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-red-600 mt-10">
        Failed to load dashboard. Please refresh.
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ================= TEACHER VIEW ================= */}
      {user.role === "teacher" && (
        <>
          {/* Teacher main */}
          {!selectedClass && !selectedAssignmentId && (
            <>
              <CreateClassForm
                onClassCreated={() => setRefreshTrigger(!refreshTrigger)}
              />

              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Your Classes</h2>

                {teacherClasses.length === 0 ? (
                  <p className="text-gray-600">No classes created yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherClasses.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => setSelectedClass(cls)}
                        className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg border transition"
                      >
                        <h3 className="text-xl font-bold">{cls.name}</h3>
                        <p className="text-sm text-indigo-600 mt-2">
                          Code: {cls.classCode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Teacher → class detail */}
          {selectedClass && !selectedAssignmentId && (
            <TeacherClassDetail
              classId={selectedClass._id}
              className={selectedClass.name}
              onBack={() => setSelectedClass(null)}
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
      {user.role === "student" && (
        <>
          {!selectedClass && (
            <>
              <JoinClassForm
                onClassJoined={() => setRefreshTrigger(!refreshTrigger)}
              />

              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Your Classes</h2>

                {studentClasses.length === 0 ? (
                  <p className="text-gray-600">
                    You have not joined any class.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentClasses.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => setSelectedClass(cls)}
                        className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg border transition"
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
            </>
          )}

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
  );
}

export default Dashboard;
