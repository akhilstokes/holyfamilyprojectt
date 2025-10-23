const Barrel = require('../models/barrelModel');
const BarrelDamage = require('../models/barrelDamageModel');
const { notifyRoles, Events } = require('./notificationService');

function computeLumbPercent(baseWeight, emptyWeight) {
  if (typeof baseWeight !== 'number' || typeof emptyWeight !== 'number' || baseWeight <= 0) return 0;
  const diff = emptyWeight - baseWeight;
  const pct = (diff / baseWeight) * 100;
  return Math.max(0, Math.round(pct * 100) / 100);
}

async function evaluateAndFlag(barrel, { userId, threshold = 20 } = {}) {
  const { baseWeight, emptyWeight } = barrel;
  const lumbPercent = computeLumbPercent(baseWeight, emptyWeight);
  barrel.lumbPercent = lumbPercent;

  if (lumbPercent > threshold) {
    barrel.condition = 'faulty';
    barrel.damageType = 'lumbed';
    // Open a damage ticket if not already open
    await BarrelDamage.create({
      barrelId: barrel._id,
      reportedBy: userId,
      source: 'lab',
      damageType: 'lumbed',
      lumbPercent,
      status: 'open',
      assignedTo: 'lumb-removal',
    });
    await notifyRoles(['manager', 'admin'], {
      title: 'Lumb Fault Detected',
      message: `Barrel ${barrel.barrelId} lumb ${lumbPercent}% exceeds threshold`,
      link: `/barrels/${barrel._id}`,
      meta: { barrelId: barrel._id, barrelCode: barrel.barrelId, lumbPercent },
    });
  }

  return barrel;
}

module.exports = { computeLumbPercent, evaluateAndFlag };
