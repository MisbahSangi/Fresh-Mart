const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ── Gzip Compression ─────────────────────────────
// Compresses all JSON responses — reduces bandwidth by 60-80%
// A 20-product listing goes from ~20KB to ~3KB
app.use(compression());

// ── Security Headers (helmet) ─────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

// ── Rate Limiting ─────────────────────────────────
// Global: 200 requests per 15 minutes (generous for normal browsing)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

// Auth: 10 attempts per 15 minutes (blocks brute-force on admin secret)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts, please try again in 15 minutes",
  },
});

app.use(globalLimiter);

// ── Body Parsers ──────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── Routes ────────────────────────────────────────
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// ── Health Check ──────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "🛒 FreshMart API Running!",
    status: "OK",
    database: "GroceryStore on MongoDB Atlas",
  });
});

// ── 404 Handler ───────────────────────────────────
if (process.env.NODE_ENV === "production") {
  // Serve React build — both static assets and client-side routing
  const buildPath = path.join(__dirname, "..", "frontend", "build");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    // Unknown /api/* paths still return JSON 404
    if (req.path.startsWith("/api")) {
      return res
        .status(404)
        .json({ success: false, message: "API route not found" });
    }
    // Everything else (/, /products, /cart, /admin, etc.) returns React
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  // Development: React runs on its own port (3000), backend is API-only
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });
}

// ── Global Error Handler ──────────────────────
// Handles Mongoose, MongoDB, JWT, and generic errors with consistent responses
app.use((err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Mongoose ValidationError — bad field value
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose CastError — invalid MongoDB ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    status = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired — please login again";
  }

  // Log in development; brief log in production
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  } else {
    console.error(`[ERROR] ${status}: ${message}`);
  }

  res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
