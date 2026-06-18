import axios from "axios";

// In production (same server), use a relative URL so no env var is needed.
// In local development, fall back to the Express dev port.
const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:5000/api"),
});

// ── Request: attach token ─────────────────────────
// Use adminToken on admin paths, customer token everywhere else.
// This prevents admin-logged-in users from accidentally using their
// admin token for customer-facing API calls in the same browser.
API.interceptors.request.use((req) => {
  const isAdminPath = window.location.pathname.startsWith("/admin");
  const token = isAdminPath
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("token");
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
});

// ── Response: handle expired / unauthorized sessions ─
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminPath = window.location.pathname.startsWith("/admin");
      if (isAdminPath) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;
