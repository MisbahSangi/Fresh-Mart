const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      ur: { type: String },
    },
    description: {
      en: String,
      ur: String,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    sku: { type: String },
    unit: { type: String },
    images: [String],
    price: {
      current: { type: Number, required: true },
      original: { type: Number },
      currency: { type: String, default: "PKR" },
    },
    stock: {
      quantity: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["in_stock", "low_stock", "out_of_stock"],
        default: "in_stock",
      },
    },
    isFeatured: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    tags: [String],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Full-text search
productSchema.index({ "name.en": "text", "name.ur": "text", tags: "text" });

// Compound indexes for the most common query patterns
// Eliminates full-collection scans on every product API call
productSchema.index({ isActive: 1, createdAt: -1 }); // GET /products (all active, newest first)
productSchema.index({ isActive: 1, categoryId: 1 }); // GET /products?category=ID
productSchema.index({ isActive: 1, isFeatured: 1 }); // GET /products?featured=true
productSchema.index({ isActive: 1, isOnSale: 1 }); // GET /products?sale=true

module.exports = mongoose.model("Product", productSchema);
