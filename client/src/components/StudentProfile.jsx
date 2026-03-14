import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Skeleton from "./Skeleton";

// Badge helper
function getRiskBadge(score) {
  if (score < 20)
    return {
      label: "Safe",
      cls: "bg-green-100 text-green-700 border border-green-200",
    };
  if (score < 50)
    return {
      label: "Moderate",
      cls: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    };
  return {
    label: "High Risk",
    cls: "bg-red-100 text-red-700 border border-red-200",
  };
}

function StudentProfile({ onBack }) {
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [userData, submissionsData] = await Promise.all([
          apiFetch("/api/users/me"),
          apiFetch("/api/submissions/me"),
        ]);
        setUser(userData);
        setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Trend chart data: submissions over time with their similarity score
  const chartData = submissions
    .slice()
    .reverse()
    .map((s, i) => ({
      index: i + 1,
      name: s?.assignment?.title
        ? s.assignment.title.slice(0, 15) + "..."
        : `#${i + 1}`,
      score: Number(s?.similarityScore || 0),
      date: s?.createdAt
        ? new Date(s.createdAt).toLocaleDateString()
        : "N/A",
    }));

  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce(
            (acc, s) => acc + Number(s?.similarityScore || 0),
            0
          ) / submissions.length
        )
      : 0;

  const highRiskCount = submissions.filter(
    (s) => Number(s?.similarityScore || 0) >= 50
  ).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-6 space-y-4">
        <Skeleton height={100} />
        <Skeleton height={200} />
        <Skeleton height={300} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-indigo-600 font-semibold hover:underline"
      >
        ← Back to Dashboard
      </button>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-black shrink-0 shadow-inner">
          {(user?.username || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {user?.username || "Unknown"}
          </h1>
          <p className="text-indigo-200 text-sm font-medium mt-1">
            {user?.email}
          </p>
          <span className="inline-flex mt-3 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold tracking-wider border border-white/20 uppercase">
            🎓 Student
          </span>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-6 sm:ml-auto">
          <div className="text-center">
            <p className="text-3xl font-black">{submissions.length}</p>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mt-1">
              Submissions
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black">{avgScore}%</p>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mt-1">
              Avg. Match
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black">{highRiskCount}</p>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mt-1">
              High Risk
            </p>
          </div>
        </div>
      </div>

      {/* Similarity Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-gray-900 mb-5">
            📈 Similarity Score Trend
          </h2>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                  }}
                  formatter={(value) => [`${value}%`, "Similarity Score"]}
                  labelFormatter={(label) => `Assignment: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{
                    r: 5,
                    fill: "#6366f1",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Submission History Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">
            📋 Submission History
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            All your submissions and plagiarism analysis results
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl block mb-4">📭</span>
            <p className="font-bold text-gray-700">No submissions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Submit an assignment to see your history here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {submissions.map((s) => {
              const score = Number(s?.similarityScore || 0);
              const risk = getRiskBadge(score);
              return (
                <div
                  key={s._id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {s?.assignment?.title || "Unknown Assignment"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted:{" "}
                      {s?.createdAt
                        ? new Date(s.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                    {/* Similarity Bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score >= 50
                              ? "bg-red-500"
                              : score >= 20
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {score}% match
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${risk.cls}`}
                    >
                      {risk.label}
                    </span>
                    {s?.filePath && (
                      <a
                        href={s.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 text-sm font-semibold hover:underline"
                      >
                        View File ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProfile;
