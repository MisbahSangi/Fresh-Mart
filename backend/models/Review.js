const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  orderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order',   required: true },
  rating:     { type: Number, min: 1, max: 5, required: true },
  comment:    { type: String, maxlength: 500 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

// One review per user per product per order
reviewSchema.index({ productId: 1, customerId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);