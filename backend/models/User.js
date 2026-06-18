const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  addressId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  type: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
  street: String,
  area: String,
  city: { type: String, default: "Sahiwal" },
  landmark: String,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    addresses: [addressSchema],
    profileImage: { type: String, default: null },
    otp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
    preferredLanguage: { type: String, enum: ["en", "ur"], default: "en" },
    notificationsEnabled: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
