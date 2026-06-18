const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/paymentController");

router.post("/create-intent", protect, ctrl.createPaymentIntent);
router.post("/confirm", protect, ctrl.confirmPayment);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  ctrl.handleWebhook,
);

module.exports = router;
