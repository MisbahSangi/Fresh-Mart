const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ur: { type: String }
  },
  slug:         { type: String, required: true, unique: true },
  icon:         { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);