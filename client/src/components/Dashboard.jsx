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
      <div className="max-w-3xl mx-auto px-4 mt-14">
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl text-red-700">
          <p className="font-bold text-lg">Dashboard failed to load ❌</p>
          <p className="text-sm mt-1">
            Please refresh the page. If the issue continues, login again.
          </p>
        </div>
      </div>
    );
  }

  const isTeacher = user.role === "teacher";
  const classCount = isTeacher ? teacherClasses.length : studentClasses.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ======= TOP HEADER ======= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isTeacher
              ? "Create classes, post assignments, and check plagiarism."
              : "Join classes, view assignments, and submit your work."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold">
            {isTeacher ? "👨‍🏫 Teacher" : "🎓 Student"}
          </div>

          <div className="px-3 py-1.5 rounded-full bg-gray-50 border text-gray-700 text-sm font-medium">
            {user.username || user.email}
          </div>
        </div>
      </div>

      {/* ================= TEACHER VIEW ================= */}
      {isTeacher && (
        <>
          {/* Teacher main */}
          {!selectedClass && !selectedAssignmentId && (
            <>
              <div className="bg-white border rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Create a Class
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Create a class and share the code with students.
                </p>

                <CreateClassForm
                  onClassCreated={() => setRefreshTrigger(!refreshTrigger)}
                />
              </div>

              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Classes
                  </h2>

                  <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Total: {classCount}
                  </span>
                </div>

                {teacherClasses.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                    <p className="font-bold text-gray-900">
                      No classes created yet ✨
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Create your first class above to start posting
                      assignments.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherClasses.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => setSelectedClass(cls)}
                        className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border transition group"
                      >
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-700 transition">
                          {cls.name}
                        </h3>

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm text-gray-500">Class Code</p>
                          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            {cls.classCode}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mt-4">
                          Click to open class →
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
      {!isTeacher && (
        <>
          {!selectedClass && (
            <>
              <div className="bg-white border rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Join a Class
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Enter the class code shared by your teacher.
                </p>

                <JoinClassForm
                  onClassJoined={() => setRefreshTrigger(!refreshTrigger)}
                />
              </div>

              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Classes
                  </h2>

                  <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Total: {classCount}
                  </span>
                </div>

                {studentClasses.length === 0 ? (
                  <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl">
                    <p className="font-bold text-gray-900">
                      You haven't joined any class yet 📚
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Join a class using the code above to see assignments.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentClasses.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => setSelectedClass(cls)}
                        className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border transition group"
                      >
                        <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-700 transition">
                          {cls.name}
                        </h3>

                        <p className="text-sm text-gray-500 mt-2">
                          Teacher:{" "}
                          <span className="font-semibold text-gray-800">
                            {cls.teacher?.username || "Unknown"}
                          </span>
                        </p>

                        <p className="text-xs text-gray-400 mt-4">
                          Click to view assignments →
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
