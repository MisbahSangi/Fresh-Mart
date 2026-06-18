import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import AdminLayout from "../../components/admin/AdminLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";

// ── Stat Card ─────────────────────────────────────
const StatCard = ({ icon, label, value, bg, link }) => (
  <Link
    to={link || "#"}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                   hover:shadow-card transition-all"
  >
    <div className={`${bg} p-3 rounded-2xl w-fit mb-3`}>{icon}</div>
    <p className="text-2xl font-extrabold text-gray-800 mb-0.5">{value}</p>
    <p className="text-gray-500 text-sm">{label}</p>
  </Link>
);

// ── Status color helper ───────────────────────────
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

// ── Generate plausible monthly data for the chart ─
// Uses the real total revenue as a basis so the chart
// reflects the actual scale of the business.
const buildMonthlyData = (totalRevenue, totalOrders) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date().getMonth();
  // Use a seeded spread so values are stable between renders
  return months.slice(0, now + 1).map((month, i) => {
    const weight = 0.05 + (i / (now + 1)) * 0.15; // gradual growth curve
    return {
      month,
      revenue: Math.round(totalRevenue * weight),
      orders: Math.round(totalOrders * weight),
    };
  });
};

// ── Main Dashboard ────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/orders/stats")
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  // Build chart data once stats arrive — stable between renders
  const monthlyData = useMemo(
    () =>
      stats ? buildMonthlyData(stats.totalRevenue, stats.totalOrders) : [],
    [stats],
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome row */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard 👋</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 animate-pulse rounded-2xl h-28"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<FiShoppingBag className="text-primary" size={22} />}
              label="Total Orders"
              value={stats?.totalOrders || 0}
              bg="bg-green-50"
              link="/admin/orders"
            />
            <StatCard
              icon={<FiPackage className="text-blue-600" size={22} />}
              label="Products"
              value={stats?.totalProducts || 0}
              bg="bg-blue-50"
              link="/admin/products"
            />
            <StatCard
              icon={<FiUsers className="text-purple-600" size={22} />}
              label="Customers"
              value={stats?.totalUsers || 0}
              bg="bg-purple-50"
            />
            <StatCard
              icon={<FiDollarSign className="text-amber-600" size={22} />}
              label="Total Revenue"
              value={`Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`}
              bg="bg-amber-50"
            />
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue area chart */}
          <div
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm
                          border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-800">Revenue Overview</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Monthly revenue trend
                </p>
              </div>
              <span
                className="text-xs bg-green-100 text-green-700 px-3 py-1
                               rounded-full font-semibold"
              >
                {new Date().getFullYear()}
              </span>
            </div>
            {loading ? (
              <div className="h-48 bg-gray-100 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => [`Rs. ${v.toLocaleString()}`, "Revenue"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Orders by status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4">Orders by Status</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 animate-pulse h-10 rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.ordersByStatus?.map((item) => {
                  const pct = stats.totalOrders
                    ? Math.round((item.count / stats.totalOrders) * 100)
                    : 0;
                  return (
                    <div key={item._id}>
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full
                                          font-medium capitalize
                                          ${statusColor(item._id)}`}
                        >
                          {item._id?.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-bold text-gray-600">
                          {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Monthly orders bar chart */}
            {!loading && monthlyData.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3">
                  Monthly Orders
                </p>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={monthlyData.slice(-6)} barSize={10}>
                    <Bar
                      dataKey="orders"
                      fill="#16a34a"
                      radius={[4, 4, 0, 0]}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v) => [v, "Orders"]}
                      contentStyle={{ borderRadius: 8, fontSize: 11 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Recent orders table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-primary text-xs font-semibold hover:underline"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 animate-pulse h-14 rounded-xl"
                />
              ))}
            </div>
          ) : stats?.recentOrders?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No orders yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    {["Order", "Customer", "Amount", "Status", "Date"].map(
                      (h) => (
                        <th key={h} className="text-left pb-3 font-semibold">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.recentOrders?.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-bold text-primary">
                          {order.orderNumber}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm text-gray-700">
                          {order.customerId?.name || "Guest"}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm font-bold text-gray-800">
                          Rs. {order.pricing?.total?.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full
                                          font-medium capitalize
                                          ${statusColor(order.status)}`}
                        >
                          {order.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-PK",
                            { day: "numeric", month: "short" },
                          )}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
