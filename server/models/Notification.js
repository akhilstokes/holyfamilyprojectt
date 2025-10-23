const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false, index: true },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
