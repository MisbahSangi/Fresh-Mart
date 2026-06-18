const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    en: String,
    ur: String
  },
  description: {
    en: String,
    ur: String
  },
  image:        String,
  discountType: { type: String, enum: ['percentage','fixed_amount'] },
  discountValue: Number,
  minOrderAmount: { type: Number, default: 0 },
  code:           { type: String, uppercase: true },
  validFrom:      Date,
  validUntil:     Date,
  applicableProducts:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  usageLimit: Number,
  usageCount: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);