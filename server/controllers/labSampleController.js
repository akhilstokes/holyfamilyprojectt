const LabSample = require('../models/labSampleModel');
const SellRequest = require('../models/sellRequestModel');
const LatexRequest = require('../models/latexRequestModel');
const User = require('../models/userModel');

// Lab dashboard summary KPIs
exports.getSummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const pendingCount = await SellRequest.countDocuments({ status: 'DELIVERED_TO_LAB' });
    const testedToday = await SellRequest.find({ status: 'TESTED', testedAt: { $gte: startOfDay, $lte: endOfDay } })
      .select('drcPct')
      .lean();
    const doneToday = testedToday.length;
    const avgDrcToday = doneToday > 0
      ? Math.round((testedToday.reduce((sum, d) => sum + (Number(d.drcPct) || 0), 0) / doneToday) * 100) / 100
      : 0;

    return res.json({ pendingCount, doneToday, avgDrcToday });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load summary' });
  }
};

// Accept lab samples into the lab inventory
exports.sampleCheckIn = async (req, res) => {
  try {
    const { sampleId, customerName, supplier, batch, quantityLiters, receivedAt, notes, barrelCount, barrels } = req.body || {};
    if (!sampleId || quantityLiters == null) {
      return res.status(400).json({ message: 'sampleId and quantityLiters are required' });
    }
    const doc = await LabSample.create({
      sampleId: String(sampleId).trim(),
      customerName: customerName ? String(customerName) : '',
      supplier: supplier ? String(supplier) : '',
      batch: batch ? String(batch) : '',
      quantityLiters: Number(quantityLiters),
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
      notes: notes ? String(notes) : '',
      barrelCount: barrelCount != null ? Number(barrelCount) : 0,
      barrels: Array.isArray(barrels) ? barrels.map(b => ({ barrelId: String(b.barrelId || ''), liters: b.liters != null ? Number(b.liters) : null })) : [],
      receivedBy: req.user && req.user._id ? req.user._id : null,
    });
    
    // ✅ AUTOMATICALLY CREATE LATEX REQUEST FOR DRC TESTING
    // This makes the sample appear in the DRC Test page
    try {
      // Find user ID for the request (required field)
      let userId = req.user && req.user._id ? req.user._id : null;
      
      // If no authenticated user, try to find a lab_staff user as fallback
      if (!userId) {
        const labUser = await User.findOne({ role: 'lab_staff' }).select('_id');
        userId = labUser ? labUser._id : null;
      }
      
      // Only create if we have a valid user ID
      if (userId) {
        const latexRequest = new LatexRequest({
          user: userId,
          externalSampleId: String(sampleId).trim(),
          overrideBuyerName: supplier || customerName || 'Lab Sample',
          quantity: Number(quantityLiters),
          drcPercentage: 0, // Will be updated during testing
          barrelCount: barrelCount != null ? Number(barrelCount) : 0,
          batch: batch ? String(batch) : '',
          // Required fields with defaults
          quality: 'standard',
          location: 'lab',
          contactNumber: '-',
          currentRate: 0,
          estimatedPayment: 0,
          // Set status to COLLECTED so it appears in pending tests
          status: 'COLLECTED',
          collectedAt: receivedAt ? new Date(receivedAt) : new Date(),
          notes: notes ? String(notes) : '',
        });
        await latexRequest.save();
        console.log(`✅ Auto-created LatexRequest ${latexRequest._id} for LabSample ${sampleId}`);
      } else {
        console.warn('⚠️ Could not auto-create LatexRequest: No user ID available');
      }
    } catch (latexError) {
      // Don't fail sample check-in if latex request creation fails
      console.error('❌ Failed to auto-create LatexRequest:', latexError.message);
    }
    
    return res.status(201).json({ success: true, sample: doc });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to check in sample', error: e.message });
  }
};

// Get pending samples for lab processing
exports.getPendingSamples = async (req, res) => {
  try {
    const pendingSamples = await SellRequest.find({ status: 'DELIVERED_TO_LAB' })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    
    return res.json(pendingSamples);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load pending samples', error: e.message });
  }
};

// Get samples processed today
exports.getTodaySamples = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySamples = await SellRequest.find({ 
      status: 'TESTED', 
      testedAt: { $gte: startOfDay, $lte: endOfDay } 
    })
      .populate('user', 'name email phone')
      .sort({ testedAt: -1 })
      .lean();
    
    return res.json(todaySamples);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load today samples', error: e.message });
  }
};