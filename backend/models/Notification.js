const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type:   { type: String, enum: ['sms','whatsapp','push'] },
  title:  String,
  message: {
    en: String,
    ur: String
  },
  sentAt:   { type: Date, default: Date.now },
  status:   { type: String, enum: ['pending','sent','failed'], default: 'pending' },
  template: String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);