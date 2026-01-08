const API_BASE = "http://localhost:5000";

export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const headers = {
        ...(options.headers || {}),
        "Content-Type": options.body instanceof FormData ? undefined : "application/json",
        ...(token ? { "x-auth-token": token } : {})
    };

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.msg || "API Error");
    }
    return data;
};
