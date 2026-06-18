import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useOrders from "../../hooks/useOrders";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiEdit2,
  FiSave,
  FiX,
  FiShoppingBag,
  FiLogOut,
  FiCamera,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const { orders } = useOrders(user?._id, 3); // show last 3 orders
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Fetch latest profile to get profileImage
    API.get("/auth/profile")
      .then((res) => {
        if (res.data.data.profileImage) {
          setProfileImage(res.data.data.profileImage);
        }
      })
      .catch(() => {});
  }, [user, navigate]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2MB");
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await API.post("/upload/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileImage(res.data.url);
      // Update user in context
      const updatedUser = { ...user, profileImage: res.data.url };
      login(updatedUser, localStorage.getItem("token"));
      toast.success("Profile photo updated! 📸");
    } catch (err) {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      return toast.error("Name cannot be empty");
    }
    setSaving(true);
    try {
      const res = await API.put("/auth/profile", form);
      login(res.data.data, localStorage.getItem("token"));
      toast.success("Profile updated! ✅");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const statusColor = (status) => {
    const map = {
      received: "bg-blue-100 text-blue-700",
      preparing: "bg-yellow-100 text-yellow-700",
      out_for_delivery: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Profile Card */}
      <div
        className="bg-white rounded-2xl shadow-sm border
                      border-gray-100 overflow-hidden mb-6"
      >
        {/* Green Banner */}
        <div className="bg-gradient-to-r from-primary to-secondary h-28 relative">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-4 right-4 bg-white bg-opacity-20
                         text-white border border-white border-opacity-40
                         px-3 py-1.5 rounded-full text-xs font-medium
                         flex items-center gap-1.5 hover:bg-opacity-30
                         transition"
            >
              <FiEdit2 size={12} /> Edit Profile
            </button>
          )}

          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              {/* Photo circle */}
              <div
                className="bg-white border-4 border-white rounded-full
                              w-24 h-24 overflow-hidden shadow-md"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-primary flex
                                  items-center justify-center"
                  >
                    <span className="text-3xl font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Camera button */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 bg-primary text-white
                           w-8 h-8 rounded-full flex items-center justify-center
                           hover:bg-secondary transition shadow-md
                           disabled:opacity-60"
              >
                {uploadingPhoto ? (
                  <div
                    className="w-3 h-3 border-2 border-white
                                    border-t-transparent rounded-full
                                    animate-spin"
                  />
                ) : (
                  <FiCamera size={14} />
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="pt-16 px-6 pb-6">
          {!editing ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-400 text-sm">FreshMart Customer</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div
                  className="flex items-center gap-3 bg-gray-50
                                rounded-xl px-4 py-3"
                >
                  <FiPhone className="text-primary flex-shrink-0" size={16} />
                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="text-sm font-medium text-gray-800">
                      {user.phoneNumber}
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 bg-gray-50
                                rounded-xl px-4 py-3"
                >
                  <FiMail className="text-primary flex-shrink-0" size={16} />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-800">
                      {user.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Edit Profile</h2>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Full Name *
                </label>
                <div
                  className="flex items-center border border-gray-200
                                rounded-xl overflow-hidden"
                >
                  <FiUser className="ml-3 text-gray-400" size={15} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="flex-1 px-3 py-3 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Email
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <div
                  className="flex items-center border border-gray-200
                                rounded-xl overflow-hidden"
                >
                  <FiMail className="ml-3 text-gray-400" size={15} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="flex-1 px-3 py-3 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400">Phone Number</p>
                <p className="text-sm font-medium text-gray-600">
                  {user.phoneNumber}
                  <span className="text-xs text-gray-400 ml-2">
                    (cannot be changed)
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({ name: user.name, email: user.email || "" });
                  }}
                  className="flex-1 border border-gray-200 text-gray-600
                             py-2.5 rounded-xl text-sm font-medium
                             flex items-center justify-center gap-2
                             hover:bg-gray-50 transition"
                >
                  <FiX size={15} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-white py-2.5
                             rounded-xl text-sm font-semibold
                             flex items-center justify-center gap-2
                             hover:bg-secondary transition disabled:opacity-60"
                >
                  <FiSave size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div
        className="bg-white rounded-2xl shadow-sm border
                      border-gray-100 p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiShoppingBag className="text-primary" size={16} />
            Recent Orders
          </h3>
          <Link
            to="/orders"
            className="text-primary text-xs hover:underline font-medium"
          >
            View All →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-sm">No orders yet</p>
            <Link
              to="/products"
              className="text-primary text-xs hover:underline mt-1 block"
            >
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between
                              bg-gray-50 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.items?.length} item(s) · Rs. {order.pricing?.total}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded-full
                                    font-medium capitalize
                                    ${statusColor(order.status)}`}
                  >
                    {order.status?.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2
                   border-2 border-red-200 text-red-500 font-semibold
                   py-3 rounded-xl hover:bg-red-50 transition"
      >
        <FiLogOut size={16} /> Logout
      </button>
    </div>
  );
};

export default ProfilePage;
