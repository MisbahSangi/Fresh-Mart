const express = require("express");
const router = express.Router();
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const { validateReview } = require("../middleware/validation");
const ctrl = require("../controllers/reviewController");

// Public
router.get("/product/:productId", ctrl.getProductReviews);

// Customer (protected)
router.get("/can-review/:productId", protect, ctrl.checkCanReview);
router.post("/", protect, validateReview, ctrl.createReview);

// Admin
router.get("/admin/all", protect, requireAdmin, ctrl.getAllReviews);
router.put("/:id/toggle", protect, requireAdmin, ctrl.toggleReview);
router.delete("/:id", protect, requireAdmin, ctrl.deleteReview);

module.exports = router;
