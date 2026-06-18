const express = require("express");
const router = express.Router();
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const { validateOrder } = require("../middleware/validation");
const ctrl = require("../controllers/orderController");

// Admin routes
router.get("/stats", protect, requireAdmin, ctrl.getOrderStats);
router.get("/", protect, requireAdmin, ctrl.getAllOrders);
router.put("/:id/status", protect, requireAdmin, ctrl.updateOrderStatus);

// Customer routes
router.get("/user/:userId", protect, ctrl.getUserOrders);
router.post("/", protect, validateOrder, ctrl.createOrder);

// Single order — must come AFTER named routes to avoid conflict
router.get("/:id", protect, requireAdmin, ctrl.getOrderById);

module.exports = router;
