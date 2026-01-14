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

  // 🔥 Teacher summary states
  const [teacherSummaryLoading, setTeacherSummaryLoading] = useState(false);
  const [teacherSummary, setTeacherSummary] = useState({
    totalAssignments: 0,
    totalSubmissions: 0,
    safe: 0,
    moderate: 0,
    high: 0,
    topSuspicious: [], // will contain enriched items
  });

  // 🔐 Load logged-in user
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await apiFetch("/api/users/me");
        setUser(userData);

        if (userData.role === "teacher") {
          const classes = await apiFetch("/api/classes/teacher");
          setTeacherClasses(classes || []);
        } else {
          const classes = await apiFetch("/api/classes/student");
          setStudentClasses(classes || []);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshTrigger]);

  // ✅ Teacher summary fetch (Assignments + Submissions across all classes)
  useEffect(() => {
    const loadTeacherSummary = async () => {
      if (!user || user.role !== "teacher") return;

      if (!teacherClasses || teacherClasses.length === 0) {
        setTeacherSummary({
          totalAssignments: 0,
          totalSubmissions: 0,
          safe: 0,
          moderate: 0,
          high: 0,
          topSuspicious: [],
        });
        return;
      }

      // Only load summary on main teacher dashboard screen
      if (selectedClass || selectedAssignmentId) return;

      try {
        setTeacherSummaryLoading(true);

        // 1) Fetch all assignments for all classes
        const assignmentsByClass = await Promise.all(
          teacherClasses.map((cls) =>
            apiFetch(`/api/assignments/class/${cls._id}`).catch(() => [])
          )
        );

        const allAssignments = assignmentsByClass.flat().filter(Boolean);

        // Build assignmentId -> assignmentTitle map
        const assignmentTitleMap = {};
        for (const a of allAssignments) {
          assignmentTitleMap[a._id] = a.title || "Untitled Assignment";
        }

        // 2) Fetch submissions for each assignment
        const submissionsByAssignment = await Promise.all(
          allAssignments.map((a) =>
            apiFetch(`/api/submissions/assignment/${a._id}`).catch(() => [])
          )
        );

        const allSubmissions = submissionsByAssignment.flat().filter(Boolean);

        // 3) Count risk buckets
        let safe = 0,
          moderate = 0,
          high = 0;

        for (const s of allSubmissions) {
          const score = Number(s.similarityScore || 0);
          if (score < 20) safe++;
          else if (score < 50) moderate++;
          else high++;
        }

        // 4) Top suspicious (highest similarity)
        const topSuspiciousRaw = [...allSubmissions]
          .sort(
            (a, b) =>
              Number(b.similarityScore || 0) - Number(a.similarityScore || 0)
          )
          .slice(0, 3);

        // Enrich top suspicious with assignment title
        const topSuspicious = topSuspiciousRaw.map((s) => ({
          ...s,
          assignmentTitle: assignmentTitleMap[s.assignment] || "Unknown Assignment",
        }));

        setTeacherSummary({
          totalAssignments: allAssignments.length,
          totalSubmissions: allSubmissions.length,
          safe,
          moderate,
          high,
          topSuspicious,
        });
      } catch (err) {
        console.error("Teacher summary load failed:", err);
      } finally {
        setTeacherSummaryLoading(false);
      }
    };

    loadTeacherSummary();
  }, [user, teacherClasses, selectedClass, selectedAssignmentId]);

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
              {/* ✅ Teacher Summary */}
              <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Teacher Summary 📊
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Overview of assignments & plagiarism risk across all
                      classes.
                    </p>
                  </div>

                  <button
                    onClick={() => setRefreshTrigger(!refreshTrigger)}
                    className="text-sm font-semibold text-indigo-700 hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                {teacherSummaryLoading ? (
                  <div className="mt-5 space-y-3">
                    <Skeleton height={60} />
                    <Skeleton height={60} />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                      <div className="bg-gray-50 border rounded-xl p-4">
                        <p className="text-xs text-gray-500">Classes</p>
                        <p className="text-2xl font-extrabold text-gray-900">
                          {classCount}
                        </p>
                      </div>

                      <div className="bg-gray-50 border rounded-xl p-4">
                        <p className="text-xs text-gray-500">Assignments</p>
                        <p className="text-2xl font-extrabold text-gray-900">
                          {teacherSummary.totalAssignments}
                        </p>
                      </div>

                      <div className="bg-gray-50 border rounded-xl p-4">
                        <p className="text-xs text-gray-500">Submissions</p>
                        <p className="text-2xl font-extrabold text-gray-900">
                          {teacherSummary.totalSubmissions}
                        </p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs text-green-700">Safe (&lt;20%)</p>
                        <p className="text-2xl font-extrabold text-green-800">
                          {teacherSummary.safe}
                        </p>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-xs text-red-700">High Risk (50%+)</p>
                        <p className="text-2xl font-extrabold text-red-800">
                          {teacherSummary.high}
                        </p>
                      </div>
                    </div>

                    {/* Moderate + Top Suspicious */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                        <p className="text-sm font-bold text-yellow-800">
                          Moderate Risk (20–49%)
                        </p>
                        <p className="text-3xl font-extrabold text-yellow-900 mt-2">
                          {teacherSummary.moderate}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          These need a quick review but may not be plagiarism.
                        </p>
                      </div>

                      <div className="bg-white border rounded-xl p-5">
                        <p className="text-sm font-bold text-gray-900">
                          Top Suspicious Submissions 🚨
                        </p>

                        {teacherSummary.topSuspicious.length === 0 ? (
                          <p className="text-sm text-gray-500 mt-3">
                            No submissions yet.
                          </p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {teacherSummary.topSuspicious.map((s) => {
                              const score = Number(s.similarityScore || 0);

                              return (
                                <div
                                  key={s._id}
                                  className="flex items-center justify-between bg-gray-50 border rounded-lg p-3 gap-3"
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                      {s.student?.username || "Unknown Student"}
                                    </p>

                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                      Assignment:{" "}
                                      <span className="font-semibold text-gray-700">
                                        {s.assignmentTitle}
                                      </span>
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-extrabold text-red-700">
                                      {score}%
                                    </span>

                                    <button
                                      onClick={() =>
                                        setSelectedAssignmentId(s.assignment)
                                      }
                                      className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition"
                                    >
                                      Open Report
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Create Class */}
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

              {/* Your Classes */}
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
