const mongoose = require('mongoose');

const routeTaskSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    routeName: { type: String, default: '' },
    from: { type: String, default: '' },
    to: { type: String, default: '' },
    status: { type: String, enum: ['assigned', 'in_progress', 'completed', 'paused', 'cancelled'], default: 'assigned' },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

routeTaskSchema.index({ staff: 1, date: -1 });

module.exports = mongoose.model('RouteTask', routeTaskSchema);


