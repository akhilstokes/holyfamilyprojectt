const BarrelRequest = require('../models/barrelRequestModel');
const IssueReport = require('../models/issueReportModel');

// Barrel Requests
exports.createBarrelRequest = async (req, res) => {
  try {
    const { quantity, notes = '' } = req.body;
    if (!quantity || Number(quantity) < 1) return res.status(400).json({ message: 'quantity is required' });
    const doc = await BarrelRequest.create({ user: req.user._id, quantity: Number(quantity), notes });
    return res.status(201).json(doc);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.listMyBarrelRequests = async (req, res) => {
  try {
    const list = await BarrelRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Issue Reports
exports.createIssueReport = async (req, res) => {
  try {
    const { category = 'other', title, description = '' } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    const doc = await IssueReport.create({ user: req.user._id, category, title, description });
    return res.status(201).json(doc);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.listMyIssues = async (req, res) => {
  try {
    const list = await IssueReport.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};


