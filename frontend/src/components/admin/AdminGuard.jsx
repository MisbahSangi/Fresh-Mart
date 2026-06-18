import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const AdminGuard = ({ children }) => {
  const navigate = useNavigate();
  // 'checking' | 'verified' | 'denied'
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    // No token at all — redirect immediately
    if (!token) {
      navigate("/admin/login");
      setStatus("denied");
      return;
    }

    // Verify with server: confirm the token belongs to a real admin
    API.get("/auth/profile")
      .then((res) => {
        if (res.data.data?.isAdmin === true) {
          setStatus("verified");
        } else {
          // Valid token but not an admin account
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          navigate("/admin/login");
          setStatus("denied");
        }
      })
      .catch(() => {
        // Token invalid or expired
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        setStatus("denied");
      });
  }, [navigate]);

  // Show a clean loading screen while verifying
  if (status === "checking") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-white border-t-transparent
                          rounded-full animate-spin mx-auto mb-3"
          />
          <p className="text-gray-400 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (status !== "verified") return null;
  return children;
};

export default AdminGuard;
