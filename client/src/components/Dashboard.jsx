import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

import CreateClassForm from "./CreateClassForm";
import JoinClassForm from "./JoinClassForm";
import TeacherClassDetail from "./TeacherClassDetail";
import ClassDetail from "./ClassDetail";
import SubmissionList from "./SubmissionList";
import StudentProfile from "./StudentProfile";
import Skeleton from "./Skeleton";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [teacherClasses, setTeacherClasses] = useState([]);
  const [studentClasses, setStudentClasses] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Decorative corner blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-70 pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            {isTeacher
              ? "Create classes, post assignments, and check plagiarism."
              : "Join classes, view assignments, and submit your work."}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${isTeacher ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
            {isTeacher ? "👨‍🏫 Teacher" : "🎓 Student"}
          </div>

          {/* Student Profile Button */}
          {!isTeacher && (
            <button
              onClick={() => { setShowProfile(true); setSelectedClass(null); }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-2 transition-colors"
            >
              👤 My Profile
            </button>
          )}

          <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {user.username || user.email}
          </div>
        </div>
      </div>

      {/* Student Profile View */}
      {showProfile && !isTeacher && (
        <StudentProfile onBack={() => setShowProfile(false)} />
      )}

      {/* ================= TEACHER VIEW ================= */}
      {isTeacher && (
        <>
          {/* Teacher main */}
          {!selectedClass && !selectedAssignmentId && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* ✅ Teacher Summary */}
              <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-8 relative overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                      Overview 📊
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Plagiarism risk and assignments across all classes
                    </p>
                  </div>

                  <button
                    onClick={() => setRefreshTrigger(!refreshTrigger)}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Classes</p>
                        <p className="text-3xl font-black text-gray-900">
                          {classCount}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Assignments</p>
                        <p className="text-3xl font-black text-gray-900">
                          {teacherSummary.totalAssignments}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Submissions</p>
                        <p className="text-3xl font-black text-gray-900">
                          {teacherSummary.totalSubmissions}
                        </p>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-200 rounded-full blur-xl opacity-50"></div>
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 relative z-10">Safe (&lt;20%)</p>
                        <p className="text-3xl font-black text-emerald-800 relative z-10">
                          {teacherSummary.safe}
                        </p>
                      </div>

                      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-200 rounded-full blur-xl opacity-50"></div>
                        <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 relative z-10">High Risk (50%+)</p>
                        <p className="text-3xl font-black text-rose-800 relative z-10">
                          {teacherSummary.high}
                        </p>
                      </div>
                    </div>

                    {/* ✅ NEW: RECHARTS ANALYTICS */}
                    {(teacherSummary.totalSubmissions > 0) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Risk Distribution Pie Chart */}
                        <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col items-center">
                          <h3 className="text-sm font-extrabold tracking-wider text-gray-500 uppercase mb-4 w-full text-center">Risk Distribution</h3>
                          <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Safe', value: teacherSummary.safe, color: '#10B981' },
                                    { name: 'Moderate', value: teacherSummary.moderate, color: '#F59E0B' },
                                    { name: 'High', value: teacherSummary.high, color: '#F43F5E' },
                                  ].filter((d) => d.value > 0)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {
                                    [
                                      { name: 'Safe', value: teacherSummary.safe, color: '#10B981' },
                                      { name: 'Moderate', value: teacherSummary.moderate, color: '#F59E0B' },
                                      { name: 'High', value: teacherSummary.high, color: '#F43F5E' },
                                    ].filter((d) => d.value > 0).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                    ))
                                  }
                                </Pie>
                                <RechartsTooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Top Suspicious Bar Chart */}
                        <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col">
                          <h3 className="text-sm font-extrabold tracking-wider text-gray-500 uppercase mb-4 text-center">Highest Similarity Submissions</h3>
                          <div className="w-full h-[250px]">
                            {teacherSummary.topSuspicious.length > 0 ? (
                               <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={teacherSummary.topSuspicious.map(s => ({
                                 name: Array.from(s?.student?.username || 'U')[0].toUpperCase(),
                                 fullUsername: s?.student?.username || 'Unknown',
                                 score: Number(s.similarityScore || 0)
                               }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                 <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                 <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                 <RechartsTooltip 
                                    cursor={{fill: '#f3f4f6'}}
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div className="bg-gray-900 text-white rounded-lg px-3 py-2 text-sm shadow-xl">
                                            <p className="font-bold">{payload[0].payload.fullUsername}</p>
                                            <p>{payload[0].value}% Match</p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                 />
                                 <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                   {
                                     teacherSummary.topSuspicious.map((s, index) => {
                                       const score = Number(s.similarityScore || 0);
                                       const fill = score > 50 ? '#F43F5E' : (score > 20 ? '#F59E0B' : '#10B981');
                                       return <Cell key={`cell-${index}`} fill={fill} />
                                     })
                                   }
                                 </Bar>
                               </BarChart>
                             </ResponsiveContainer>
                            ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                  <span className="text-3xl mb-2">🎉</span>
                                  <p className="text-sm font-bold">No similarity data to chart!</p>
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Moderate + Top Suspicious */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                      <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                          <svg className="w-24 h-24 text-amber-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="relative z-10">
                          <p className="text-sm font-extrabold text-amber-800 uppercase tracking-wider">
                            Moderate Risk (20–49%)
                          </p>
                          <p className="text-5xl font-black text-amber-900 mt-4 tracking-tighter">
                            {teacherSummary.moderate}
                          </p>
                          <p className="text-sm font-medium text-amber-700/80 mt-3 leading-relaxed max-w-[80%]">
                            These submissions show some similarity and may need a quick manual review.
                          </p>
                        </div>
                      </div>

                      <div className="lg:col-span-3 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <span className="text-xl">🚨</span>
                          </div>
                          <p className="text-lg font-extrabold text-gray-900">
                            Top Suspicious Submissions
                          </p>
                        </div>

                        {teacherSummary.topSuspicious.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <span className="text-4xl mb-3">✨</span>
                            <p className="text-sm font-bold text-gray-600">All clear!</p>
                            <p className="text-xs text-gray-500 mt-1">No suspicious submissions found yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {teacherSummary.topSuspicious.map((s) => {
                              const score = Number(s.similarityScore || 0);

                              return (
                                <div
                                  key={s._id}
                                  className="flex items-center justify-between bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-2xl p-4 gap-4 transition-all group"
                                >
                                  <div className="min-w-0 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                      <span className="font-bold text-indigo-700">
                                        {(s.student?.username || "U")[0].toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900 truncate">
                                        {s.student?.username || "Unknown Student"}
                                      </p>
                                      <p className="text-xs font-medium text-gray-500 truncate mt-0.5 max-w-[200px] sm:max-w-[300px]">
                                        <span className="opacity-70">in</span> {s.assignmentTitle}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Match</span>
                                      <span className="text-lg font-black text-rose-600">
                                        {score}%
                                      </span>
                                    </div>

                                    <button
                                      onClick={() =>
                                        setSelectedAssignmentId(s.assignment)
                                      }
                                      className="text-xs font-bold bg-gray-50 hover:bg-indigo-600 text-gray-700 hover:text-white px-4 py-2 rounded-xl transition-all border border-gray-200 hover:border-transparent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 sm:opacity-100 sm:translate-x-0"
                                    >
                                      Review
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
              <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-transparent rounded-full opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                    Create a Class
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mb-6">
                    Start a new workspace to organize assignments and students.
                  </p>

                  <CreateClassForm
                    onClassCreated={() => setRefreshTrigger(!refreshTrigger)}
                  />
                </div>
              </div>

              {/* Your Classes */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    Your Classes
                  </h2>

                  <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-200">
                    <span>{classCount}</span>
                    <span className="opacity-50 text-xs uppercase tracking-wider">Total</span>
                  </div>
                </div>

                {teacherClasses.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl text-center">
                    <span className="text-4xl mb-4 block">👩‍🏫</span>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      No classes yet
                    </p>
                    <p className="text-sm font-medium text-gray-600 max-w-sm mx-auto">
                      Create your first class above to start inviting students and posting assignments.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherClasses.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => setSelectedClass(cls)}
                        className="cursor-pointer bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                        
                        <div className="flex-grow">
                          <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors mb-4 line-clamp-2">
                            {cls.name}
                          </h3>

                          <div className="flex items-center justify-between py-3 border-t border-b border-gray-50 my-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Join Code</p>
                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg font-mono tracking-wider">
                              {cls.classCode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm font-bold text-indigo-600 mt-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                          Enter Classroom
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Teacher → class detail */}
          {selectedClass && !selectedAssignmentId && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <TeacherClassDetail
                classId={selectedClass._id}
                className={selectedClass.name}
                onBack={() => setSelectedClass(null)}
                onSelectAssignment={setSelectedAssignmentId}
              />
            </div>
          )}

          {/* Teacher → plagiarism report */}
          {selectedAssignmentId && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <SubmissionList
                assignmentId={selectedAssignmentId}
                onBack={() => setSelectedAssignmentId(null)}
              />
            </div>
          )}
        </>
      )}

      {/* ================= STUDENT VIEW ================= */}
      {!isTeacher && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!selectedClass && (
            <>
              <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-transparent rounded-full opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                    Join a Class
                  </h2>
                  <p className="text-sm font-medium text-gray-500 mb-6">
                    Enter the class code shared by your teacher to access assignments.
                  </p>

                  <JoinClassForm
                    onClassJoined={() => setRefreshTrigger(!refreshTrigger)}
                  />
                </div>
              </div>

              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    Your Classes
                  </h2>

                  <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-200">
                    <span>{classCount}</span>
                    <span className="opacity-50 text-xs uppercase tracking-wider">Total</span>
                  </div>
                </div>

                {studentClasses.length === 0 ? (
                  <div className="bg-green-50/50 border border-green-100 p-8 rounded-3xl text-center">
                    <span className="text-4xl mb-4 block">📚</span>
                    <p className="font-bold text-xl text-gray-900 mb-2">
                      No classes joined yet
                    </p>
                    <p className="text-sm font-medium text-gray-600 max-w-sm mx-auto">
                      Use the join code provided by your teacher in the form above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentClasses.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => setSelectedClass(cls)}
                        className="cursor-pointer bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
                      >
                         <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                        
                        <div className="flex-grow">
                          <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-green-600 transition-colors mb-4 line-clamp-2">
                            {cls.name}
                          </h3>

                          <div className="flex items-center gap-3 py-3 border-t border-b border-gray-50 my-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <span className="text-xs font-bold text-gray-500">
                                {(cls.teacher?.username || "T")[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Teacher</p>
                               <span className="text-sm font-bold text-gray-800">
                                 {cls.teacher?.username || "Unknown"}
                               </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center text-sm font-bold text-green-600 mt-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                          View Assignments
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {selectedClass && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <ClassDetail
                classId={selectedClass._id}
                className={selectedClass.name}
                onBack={() => setSelectedClass(null)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
