const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  quantity: Number,
  unit: String,
  price: Number,
  total: Number,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestInfo: {
      name: String,
      phoneNumber: String,
      address: {
        street: String,
        area: String,
        landmark: String,
      },
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      discount: {
        code: { type: String, default: null },
        amount: { type: Number, default: 0 },
      },
      total: { type: Number, default: 0 },
    },
    payment: {
      method: {
        type: String,
        enum: ["cash_on_delivery", "easypaisa", "jazzcash", "card"],
        default: "cash_on_delivery",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      transactionId: { type: String, default: null },
    },
    status: {
      type: String,
      enum: [
        "received",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "received",
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    deliveryAddress: {
      street: String,
      area: String,
      city: String,
      landmark: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    notes: String,
    estimatedDelivery: Date,
  },
  { timestamps: true },
);

// Auto-generate order number before saving
// Uses _id (guaranteed unique ObjectId) — no race condition under concurrent orders
orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const suffix = this._id.toString().slice(-6).toUpperCase();
    this.orderNumber = `FM-${y}${m}${d}-${suffix}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
