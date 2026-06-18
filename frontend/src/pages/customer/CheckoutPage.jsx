import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  FiMapPin,
  FiPhone,
  FiUser,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import StripePaymentForm from "../../components/common/StripePaymentForm";

// Load Stripe outside component to avoid recreating on every render
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=details, 2=payment
  const [clientSecret, setClientSecret] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    address: "",
    city: "Sahiwal",
    paymentMethod: "cash_on_delivery",
    notes: "",
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    if (saved.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }
    setCart(saved);
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, i) => sum + i.price?.current * i.quantity,
    0,
  );
  const deliveryFee = subtotal >= 1000 ? 0 : 100;
  const total = subtotal + deliveryFee;

  // ── Step 1: Validate + Create Order ──────────────
  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }
    if (!form.address.trim()) {
      return toast.error("Please enter your delivery address");
    }

    setLoading(true);
    try {
      const orderData = {
        customerId: user._id,
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name?.en,
          quantity: item.quantity,
          price: item.price?.current,
          unit: item.unit,
        })),
        deliveryAddress: {
          street: form.address,
          city: form.city,
        },
        pricing: { subtotal, deliveryFee, total },
        payment: { method: form.paymentMethod },
        notes: form.notes,
      };

      const res = await API.post("/orders", orderData);
      const orderId = res.data.data._id;
      setCreatedOrderId(orderId);

      // If card payment — create Stripe payment intent
      if (form.paymentMethod === "card") {
        const intentRes = await API.post("/payment/create-intent", {
          amount: total,
          orderId: orderId,
        });
        setClientSecret(intentRes.data.clientSecret);
        setStep(2); // Move to payment step
      } else {
        // COD / EasyPaisa / JazzCash — complete immediately
        localStorage.removeItem("cart");
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast.success("Order placed successfully! 🎉");
        navigate("/orders", {
          state: { orderNumber: res.data.data.orderNumber },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Stripe Payment Success ───────────────
  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      await API.post("/payment/confirm", {
        paymentIntentId,
        orderId: createdOrderId,
      });
      localStorage.removeItem("cart");
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      toast.success("Payment successful! Order confirmed! 🎉");
      navigate("/orders");
    } catch (err) {
      toast.error("Payment recorded but confirmation failed — contact support");
      navigate("/orders");
    }
  };

  const handlePaymentError = (msg) => {
    toast.error(`Payment failed: ${msg}`);
  };

  // ── Stripe Elements appearance ────────────────────
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#16a34a",
        colorBackground: "#ffffff",
        colorText: "#1e293b",
        colorDanger: "#ef4444",
        fontFamily: "Poppins, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "12px",
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Steps */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h1>
        <div className="flex items-center gap-3">
          {/* Step 1 */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full
                           text-sm font-medium transition
                           ${
                             step === 1
                               ? "bg-primary text-white"
                               : "bg-green-100 text-green-700"
                           }`}
          >
            {step > 1 ? (
              <FiCheckCircle size={15} />
            ) : (
              <span
                className="w-5 h-5 rounded-full border-2 border-current
                                 flex items-center justify-center text-xs"
              >
                1
              </span>
            )}
            Delivery Details
          </div>

          {/* Divider */}
          <div
            className={`flex-1 h-0.5 max-w-16
                           ${step > 1 ? "bg-primary" : "bg-gray-200"}`}
          />

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full
                           text-sm font-medium transition
                           ${
                             step === 2
                               ? "bg-primary text-white"
                               : "bg-gray-100 text-gray-400"
                           }`}
          >
            <span
              className="w-5 h-5 rounded-full border-2 border-current
                             flex items-center justify-center text-xs"
            >
              2
            </span>
            Payment
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left Side ────────────────────────────── */}
        <div className="lg:col-span-3">
          {/* STEP 1 — Delivery Details */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Delivery Info */}
              <div
                className="bg-white rounded-xl border border-gray-100
                              shadow-sm p-5"
              >
                <h2
                  className="font-semibold text-gray-800 flex items-center
                               gap-2 mb-4"
                >
                  <FiMapPin className="text-primary" /> Delivery Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-xs font-medium
                                      text-gray-600 mb-1"
                    >
                      Full Name
                    </label>
                    <div
                      className="flex items-center border border-gray-200
                                    rounded-xl overflow-hidden"
                    >
                      <FiUser className="ml-3 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ali Hassan"
                        className="flex-1 px-3 py-3 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium
                                      text-gray-600 mb-1"
                    >
                      Phone Number
                    </label>
                    <div
                      className="flex items-center border border-gray-200
                                    rounded-xl overflow-hidden"
                    >
                      <FiPhone className="ml-3 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        placeholder="03001234567"
                        className="flex-1 px-3 py-3 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium
                                      text-gray-600 mb-1"
                    >
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House #, Street #, Area, Sahiwal"
                      rows={3}
                      className="w-full border border-gray-200
                                         rounded-xl px-4 py-3 outline-none
                                         text-sm focus:ring-2 focus:ring-primary
                                         focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium
                                      text-gray-600 mb-1"
                    >
                      Order Notes (optional)
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions..."
                      className="w-full border border-gray-200
                                      rounded-xl px-4 py-3 outline-none
                                      text-sm focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div
                className="bg-white rounded-xl border border-gray-100
                              shadow-sm p-5"
              >
                <h2 className="font-semibold text-gray-800 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      value: "cash_on_delivery",
                      label: "💵 Cash on Delivery",
                      desc: "Pay when your order arrives",
                      badge: null,
                    },
                    {
                      value: "card",
                      label: "💳 Credit / Debit Card",
                      desc: "Visa, Mastercard, Amex",
                      badge: "Stripe Secured",
                    },
                    {
                      value: "easypaisa",
                      label: "📱 EasyPaisa",
                      desc: "0334-6461739",
                      badge: null,
                    },
                    {
                      value: "jazzcash",
                      label: "📱 JazzCash",
                      desc: "0334-6461739",
                      badge: null,
                    },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-3.5
                                       rounded-xl border cursor-pointer
                                       transition
                                       ${
                                         form.paymentMethod === method.value
                                           ? "border-primary bg-green-50"
                                           : "border-gray-200 hover:border-gray-300"
                                       }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={form.paymentMethod === method.value}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800">
                            {method.label}
                          </p>
                          {method.badge && (
                            <span
                              className="text-xs bg-blue-100 text-blue-600
                                             px-2 py-0.5 rounded-full font-medium"
                            >
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4
                           rounded-xl hover:bg-secondary transition text-base
                           flex items-center justify-center gap-2
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-white
                                    border-t-transparent rounded-full
                                    animate-spin"
                    />
                    Processing...
                  </>
                ) : form.paymentMethod === "card" ? (
                  <>
                    <FiCreditCard size={18} />
                    Continue to Payment — Rs. {total}
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={18} />
                    Place Order — Rs. {total}
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2 — Stripe Payment */}
          {step === 2 && clientSecret && (
            <div
              className="bg-white rounded-xl border border-gray-100
                            shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-5">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-gray-600 transition
                             text-sm flex items-center gap-1"
                >
                  ← Back
                </button>
                <h2 className="font-semibold text-gray-800 ml-2">
                  Complete Payment
                </h2>
              </div>

              <Elements stripe={stripePromise} options={stripeOptions}>
                <StripePaymentForm
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* ── Order Summary ─────────────────────────── */}
        <div className="lg:col-span-2">
          <div
            className="bg-white rounded-xl border border-gray-100
                          shadow-sm p-5 sticky top-24"
          >
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div
                    className="bg-gray-50 rounded-lg h-10 w-10
                                  flex items-center justify-center
                                  flex-shrink-0"
                  >
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt=""
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-lg">🛍️</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {item.name?.en}
                    </p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-700 flex-shrink-0">
                    Rs. {item.price?.current * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                {deliveryFee === 0 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span>Rs. {deliveryFee}</span>
                )}
              </div>
              <div
                className="flex justify-between font-bold text-gray-800
                              text-base pt-2 border-t border-gray-100"
              >
                <span>Total</span>
                <span className="text-primary">Rs. {total}</span>
              </div>
            </div>

            {/* Payment method badge */}
            <div
              className="mt-3 flex items-center gap-2 bg-gray-50
                            rounded-xl px-3 py-2"
            >
              <FiDollarSign className="text-gray-400" size={14} />
              <span className="text-xs text-gray-500 capitalize">
                {form.paymentMethod?.replace(/_/g, " ")}
              </span>
              {form.paymentMethod === "card" && (
                <span className="ml-auto text-xs text-blue-500 font-medium">
                  🔒 Stripe
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
