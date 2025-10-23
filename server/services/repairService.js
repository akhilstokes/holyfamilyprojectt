const Barrel = require('../models/barrelModel');
const BarrelRepair = require('../models/barrelRepairModel');
const { notifyRoles } = require('./notificationService');

async function openJob(barrelId, type, userId) {
  const job = await BarrelRepair.create({ barrelId, type, openedBy: userId });
  // Move barrel to bay
  const barrel = await Barrel.findById(barrelId);
  if (barrel) {
    barrel.currentLocation = type === 'lumb-removal' ? 'lumb-bay' : 'repair-bay';
    barrel.condition = type === 'lumb-removal' ? 'lumb-removal' : 'repair';
    await barrel.save();
  }
  return job;
}

async function appendWorkLog(jobId, step, note, by) {
  const job = await BarrelRepair.findById(jobId);
  if (!job) throw new Error('Repair job not found');
  job.workLog.push({ step, note, by });
  await job.save();
  return job;
}

async function completeJob(jobId, by) {
  const job = await BarrelRepair.findById(jobId);
  if (!job) throw new Error('Repair job not found');
  job.status = 'completed';
  job.completedBy = by;
  job.approvalStatus = 'pending';
  job.status = 'awaiting-approval';
  await job.save();
  await notifyRoles(['admin'], {
    title: 'Repair Completed',
    message: 'A barrel repair is awaiting approval',
    link: `/repairs/${job._id}`,
    meta: { jobId: job._id, barrelId: job.barrelId },
  });
  return job;
}

async function approve(jobId, by) {
  const job = await BarrelRepair.findById(jobId);
  if (!job) throw new Error('Repair job not found');
  job.approvalStatus = 'approved';
  job.status = 'completed';
  job.approvedBy = by;
  await job.save();

  const barrel = await Barrel.findById(job.barrelId);
  if (barrel) {
    barrel.condition = 'ok';
    barrel.damageType = 'none';
    barrel.currentLocation = 'factory';
    await barrel.save();
  }
  return job;
}

async function reject(jobId, by) {
  const job = await BarrelRepair.findById(jobId);
  if (!job) throw new Error('Repair job not found');
  job.approvalStatus = 'rejected';
  job.status = 'rejected';
  job.approvedBy = by;
  await job.save();
  return job;
}

module.exports = { openJob, appendWorkLog, completeJob, approve, reject };
