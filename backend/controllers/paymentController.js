const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

// ── POST /api/payment/create-intent ───────────────
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "pkr", orderId } = req.body;

    if (!amount || amount < 50) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to paisa (smallest unit)
      currency,
      metadata: {
        orderId: orderId || "",
        customerId: req.user._id.toString(),
        platform: "FreshMart",
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/payment/confirm ─────────────────────
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
      });
    }

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        "payment.status": "paid",
        "payment.transactionId": paymentIntentId,
        "payment.method": "card",
      });
    }

    res.json({
      success: true,
      message: "Payment confirmed!",
      amount: paymentIntent.amount / 100,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/payment/webhook ─────────────────────
// Note: this handler expects req.body to be the raw Buffer (applied in paymentRoutes)
const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { orderId } = paymentIntent.metadata;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        "payment.status": "paid",
        "payment.transactionId": paymentIntent.id,
      });
    }
  }

  res.json({ received: true });
};

module.exports = { createPaymentIntent, confirmPayment, handleWebhook };
