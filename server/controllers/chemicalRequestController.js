const mongoose = require('mongoose');
const ChemicalRequest = require('../models/chemicalRequestModel');
const Chemical = require('../models/chemicalModel');

// Lab: create request
exports.create = async (req, res) => {
  try {
    const { chemicalName, quantity, purpose, priority } = req.body || {};
    if (!chemicalName || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'chemicalName and positive quantity are required' });
    }
    const doc = await ChemicalRequest.create({
      chemicalName: String(chemicalName).trim(),
      quantity: Number(quantity),
      purpose: purpose || '',
      priority: priority || 'normal',
      requestedBy: req.user?._id,
      status: 'PENDING'
    });
    return res.status(201).json({ success: true, request: doc });
  } catch (e) {
    console.error('chem.create error:', e);
    return res.status(500).json({ message: 'Failed to create chemical request' });
  }
};

// Lab: my requests
exports.my = async (req, res) => {
  try {
    const items = await ChemicalRequest.find({ requestedBy: req.user?._id }).sort({ createdAt: -1 }).lean();
    return res.json({ records: items });
  } catch (e) {
    console.error('chem.my error:', e);
    return res.status(500).json({ message: 'Failed to load' });
  }
};

// Manager: pending
exports.managerPending = async (_req, res) => {
  try {
    const items = await ChemicalRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 }).populate('requestedBy','name email').lean();
    return res.json({ records: items });
  } catch (e) {
    console.error('chem.managerPending error:', e);
    return res.status(500).json({ message: 'Failed to load' });
  }
};

// Manager: verify
exports.verify = async (req, res) => {
  try {
    const { id } = req.params; const { note } = req.body || {};
    const doc = await ChemicalRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    doc.status = 'MANAGER_VERIFIED'; doc.managerNote = note || '';
    await doc.save();
    return res.json({ success: true, request: doc });
  } catch (e) {
    console.error('chem.verify error:', e);
    return res.status(500).json({ message: 'Failed to verify' });
  }
};

// Manager: reject
exports.reject = async (req, res) => {
  try {
    const { id } = req.params; const { note } = req.body || {};
    const doc = await ChemicalRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    doc.status = 'REJECTED_BY_MANAGER'; doc.managerNote = note || '';
    await doc.save();
    return res.json({ success: true, request: doc });
  } catch (e) {
    console.error('chem.reject error:', e);
    return res.status(500).json({ message: 'Failed to reject' });
  }
};

// Admin: verified list
exports.adminVerified = async (_req, res) => {
  try {
    const items = await ChemicalRequest.find({ status: 'MANAGER_VERIFIED' }).sort({ updatedAt: -1 }).populate('requestedBy','name email').lean();
    return res.json({ records: items });
  } catch (e) {
    console.error('chem.adminVerified error:', e);
    return res.status(500).json({ message: 'Failed to load' });
  }
};

// Admin: send for purchase
exports.sendForPurchase = async (req, res) => {
  try {
    const { id } = req.params; const { note } = req.body || {};
    const doc = await ChemicalRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    if (doc.status !== 'MANAGER_VERIFIED') return res.status(400).json({ message: 'Request must be manager-verified' });
    doc.status = 'SENT_FOR_PURCHASE'; doc.adminNote = note || '';
    await doc.save();
    return res.json({ success: true, request: doc });
  } catch (e) {
    console.error('chem.sendForPurchase error:', e);
    return res.status(500).json({ message: 'Failed to send for purchase' });
  }
};

// Manager: purchase execution
exports.purchase = async (req, res) => {
  try {
    const { id } = req.params; const { invoiceNo, supplier, date, quantity, status } = req.body || {};
    const doc = await ChemicalRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    if (!doc.purchaseInfo) doc.purchaseInfo = {};
    if (invoiceNo) doc.purchaseInfo.invoiceNo = String(invoiceNo);
    if (supplier) doc.purchaseInfo.supplier = String(supplier);
    if (date) doc.purchaseInfo.date = new Date(date);
    if (quantity) doc.purchaseInfo.quantity = Number(quantity);
    if (status && ['PURCHASE_IN_PROGRESS','PURCHASED'].includes(status)) doc.status = status;
    else doc.status = 'PURCHASE_IN_PROGRESS';
    await doc.save();
    return res.json({ success: true, request: doc });
  } catch (e) {
    console.error('chem.purchase error:', e);
    return res.status(500).json({ message: 'Failed to save purchase info' });
  }
};

// Admin: complete and close
exports.complete = async (req, res) => {
  try {
    const { id } = req.params; const { note } = req.body || {};
    const doc = await ChemicalRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    doc.status = 'COMPLETED'; if (note) doc.adminNote = note;
    await doc.save();
    return res.json({ success: true, request: doc });
  } catch (e) {
    console.error('chem.complete error:', e);
    return res.status(500).json({ message: 'Failed to complete' });
  }
};

// Admin: history (simple)
exports.history = async (req, res) => {
  try {
    const { status } = req.query || {};
    const q = status ? { status } : {};
    const items = await ChemicalRequest.find(q).sort({ createdAt: -1 }).populate('requestedBy','name email').lean();
    return res.json({ records: items });
  } catch (e) {
    console.error('chem.history error:', e);
    return res.status(500).json({ message: 'Failed to load history' });
  }
};

// Catalog: list available chemicals (name/unit) for selection (lab-accessible)
exports.catalog = async (_req, res) => {
  try {
    const items = await Chemical.find({}, 'name unit').sort({ name: 1 }).lean();
    return res.json({ records: items });
  } catch (e) {
    console.error('chem.catalog error:', e);
    return res.status(500).json({ message: 'Failed to load catalog' });
  }
};
