const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// ── GET /api/orders — admin only ──────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name phoneNumber")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/stats — admin only ────────────
const getOrderStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      revenueResult,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customerId", "name phoneNumber")
        .lean(),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue: revenueResult[0]?.total || 0,
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/user/:userId ──────────────────
// Own orders only; admin can see any user's orders
const getUserOrders = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these orders",
      });
    }
    const orders = await Order.find({ customerId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/orders — logged-in customers ─────────
const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/orders/:id/status — admin only ────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status },
        $push: { statusHistory: { status, note, timestamp: new Date() } },
      },
      { new: true },
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/:id — admin only ────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId", "name phoneNumber email")
      .lean();
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderStats,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  getOrderById,
};
