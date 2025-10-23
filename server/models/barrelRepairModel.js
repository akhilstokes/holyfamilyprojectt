const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema({
  step: { type: String, required: true },
  note: { type: String },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const barrelRepairSchema = new mongoose.Schema({
  barrelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barrel', required: true, index: true },
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['lumb-removal', 'repair'], required: true },
  workLog: { type: [workLogSchema], default: [] },
  status: { type: String, enum: ['in-progress', 'completed', 'awaiting-approval', 'rejected'], default: 'in-progress', index: true },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('BarrelRepair', barrelRepairSchema);
