import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiPhone,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import useOrders from "../../hooks/useOrders";
import toast from "react-hot-toast";

const STATUS_STEPS = [
  {
    key: "received",
    label: "Order Received",
    icon: FiPackage,
    desc: "Your order has been placed",
  },
  {
    key: "preparing",
    label: "Preparing",
    icon: FiClock,
    desc: "We are packing your items",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    icon: FiTruck,
    desc: "On the way to your address",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: FiCheckCircle,
    desc: "Order delivered successfully",
  },
];

const getStepIndex = (status) =>
  STATUS_STEPS.findIndex((s) => s.key === status);

const OrderCard = ({ order }) => {
  const stepIndex = getStepIndex(order.status);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm
                    overflow-hidden mb-4"
    >
      {/* Order Header */}
      <div
        className="bg-gray-50 px-5 py-4 flex flex-wrap items-center
                      justify-between gap-3 border-b border-gray-100"
      >
        <div>
          <p className="text-xs text-gray-500">Order Number</p>
          <p className="font-bold text-gray-800 text-sm">{order.orderNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Date</p>
          <p className="text-sm font-medium text-gray-700">
            {new Date(order.createdAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-bold text-primary text-sm">
            Rs. {order.pricing?.total}
          </p>
        </div>
        <div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-semibold
            ${
              order.status === "delivered"
                ? "bg-green-100 text-green-700"
                : order.status === "cancelled"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.status === "received"
              ? "📦 Received"
              : order.status === "preparing"
                ? "👨‍🍳 Preparing"
                : order.status === "out_for_delivery"
                  ? "🚚 On the Way"
                  : order.status === "delivered"
                    ? "✅ Delivered"
                    : order.status === "cancelled"
                      ? "❌ Cancelled"
                      : order.status}
          </span>
        </div>
      </div>

      {/* Progress Tracker */}
      {order.status !== "cancelled" && (
        <div className="px-5 py-5">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div
              className="absolute top-5 left-0 right-0 h-1 bg-gray-200
                            mx-8 z-0"
            >
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width:
                    stepIndex === 0
                      ? "0%"
                      : stepIndex === 1
                        ? "33%"
                        : stepIndex === 2
                          ? "66%"
                          : "100%",
                }}
              />
            </div>

            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const completed = idx <= stepIndex;
              const active = idx === stepIndex;
              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center z-10 flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center
                                   justify-center transition-all
                                   ${
                                     completed
                                       ? "bg-primary text-white shadow-md"
                                       : "bg-gray-200 text-gray-400"
                                   }
                                   ${active ? "ring-4 ring-green-200" : ""}`}
                  >
                    <Icon size={18} />
                  </div>
                  <p
                    className={`text-xs font-medium mt-2 text-center
                                 hidden sm:block
                                 ${
                                   completed ? "text-primary" : "text-gray-400"
                                 }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="px-5 pb-4">
        <p
          className="text-xs font-semibold text-gray-500 uppercase
                      tracking-wide mb-3"
        >
          Items Ordered
        </p>
        <div className="space-y-2">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between
                            bg-gray-50 rounded-xl px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {typeof item.name === "object" ? item.name?.en : item.name}
                </p>
                <p className="text-xs text-gray-400">
                  {item.unit} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-primary">
                Rs. {item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
            <span className="mt-0.5">📍</span>
            <span>
              {order.deliveryAddress.street}, {order.deliveryAddress.city}
            </span>
          </div>
        )}

        {/* Payment */}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span>💳</span>
          <span className="capitalize">
            {order.payment?.method?.replace(/_/g, " ")}
          </span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full font-medium
            ${
              order.payment?.status === "paid"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {order.payment?.status || "pending"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────
const OrderTrackingPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { orders, loading } = useOrders(user?._id);

  // Show success message if redirected from checkout
  useEffect(() => {
    if (location.state?.orderNumber) {
      toast.success(`Order ${location.state.orderNumber} placed! 🎉`, {
        duration: 5000,
      });
    }
  }, [location.state]);

  // ── Not logged in ─────────────────────────────
  if (!user)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center
                    text-gray-400 px-4"
      >
        <p className="text-6xl mb-4">🔐</p>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Login to view your orders
        </h2>
        <p className="text-sm mb-6">Track all your FreshMart orders here</p>
        <Link
          to="/login"
          className="bg-primary text-white px-8 py-3 rounded-full
                       font-semibold hover:bg-secondary transition"
        >
          Login Now
        </Link>
      </div>
    );

  // ── Loading ───────────────────────────────────
  if (loading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-48" />
        ))}
      </div>
    );

  // ── No orders ─────────────────────────────────
  if (orders.length === 0)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center
                    text-gray-400 px-4"
      >
        <p className="text-6xl mb-4">📦</p>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No orders yet
        </h2>
        <p className="text-sm mb-6">
          Start shopping and your orders will appear here
        </p>
        <Link
          to="/products"
          className="bg-primary text-white px-8 py-3 rounded-full
                       font-semibold hover:bg-secondary transition"
        >
          Shop Now
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders.length} order(s) found
        </p>
      </div>

      {/* Orders List */}
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}

      {/* Help */}
      <div
        className="bg-green-50 rounded-2xl p-4 mt-6 flex
                      items-center gap-3"
      >
        <div className="bg-primary text-white p-2 rounded-full flex-shrink-0">
          <FiPhone size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Need help?</p>
          <p className="text-xs text-gray-500">
            Call us at{" "}
            <span className="text-primary font-medium">0334-6461739</span> for
            any order issues
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
