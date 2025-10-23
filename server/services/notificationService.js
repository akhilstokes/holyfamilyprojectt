const Notification = require('../models/Notification');
const User = require('../models/userModel');

async function findUsersByRoles(roles) {
  const users = await User.find({ role: { $in: roles } }).select('_id role');
  return users.map(u => u._id);
}

exports.notifyUsers = async function notifyUsers(userIds, { title, message, link, meta, role }) {
  if (!Array.isArray(userIds) || userIds.length === 0) return;
  const docs = userIds.map(userId => ({ userId, title, message, link, meta, role }));
  await Notification.insertMany(docs);
};

exports.notifyRoles = async function notifyRoles(roles, payload) {
  const ids = await findUsersByRoles(roles);
  if (ids.length) await exports.notifyUsers(ids, payload);
};

exports.Events = Object.freeze({
  LUMB_FAULT_DETECTED: 'LUMB_FAULT_DETECTED',
  BARREL_DAMAGED: 'BARREL_DAMAGED',
  REPAIR_COMPLETED: 'REPAIR_COMPLETED',
  BARREL_APPROVED: 'BARREL_APPROVED',
  SCRAP_MOVEMENT: 'SCRAP_MOVEMENT',
});
