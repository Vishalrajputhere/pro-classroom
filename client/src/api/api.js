const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Universal API fetch helper
 * - Automatically attaches JWT token
 * - Works with JSON & FormData
 * - NEVER auto-logs out
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = options.headers ? { ...options.headers } : {};

  // ✅ Attach token ONLY if present
  if (token) {
    headers["x-auth-token"] = token;
  }

  // ❗ Do NOT set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Try parsing JSON safely
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // ❌ NEVER auto logout here
  if (!response.ok) {
    const error = new Error(data?.msg || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}
