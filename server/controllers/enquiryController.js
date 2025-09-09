const Enquiry = require('../models/enquiryModel');

// User: submit enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const { items, profile, location, bankingOption } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // Minimal validation of items
    for (const it of items) {
      if (!it.productId || !it.name || typeof it.price !== 'number' || typeof it.quantity !== 'number' || it.quantity < 1) {
        return res.status(400).json({ message: 'Invalid item in enquiry' });
      }
    }

    if (!profile?.phone) {
      return res.status(400).json({ message: 'Phone is required' });
    }
    if (!location?.addressLine1 || !location?.city || !location?.state || !location?.postalCode) {
      return res.status(400).json({ message: 'Location fields are incomplete' });
    }

    const enquiry = await Enquiry.create({
      user: req.user._id,
      items,
      profile: {
        name: profile?.name || req.user.name,
        email: profile?.email || req.user.email,
        phone: profile.phone,
      },
      location,
      bankingOption: bankingOption || 'cod',
    });

    return res.status(201).json(enquiry);
  } catch (err) {
    console.error('createEnquiry error:', err);
    return res.status(500).json({ message: 'Failed to create enquiry' });
  }
};

// User: list my enquiries
exports.getMyEnquiries = async (req, res) => {
  try {
    const list = await Enquiry.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('getMyEnquiries error:', err);
    res.status(500).json({ message: 'Failed to fetch enquiries' });
  }
};

// Admin: list all enquiries
exports.getAllEnquiries = async (_req, res) => {
  try {
    const list = await Enquiry.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('getAllEnquiries error:', err);
    res.status(500).json({ message: 'Failed to fetch enquiries' });
  }
};

// Admin: approve enquiry
exports.approveEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const updated = await Enquiry.findByIdAndUpdate(
      id,
      { status: 'approved', approvedBy: req.user._id, adminNotes: adminNotes || '' },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(updated);
  } catch (err) {
    console.error('approveEnquiry error:', err);
    res.status(500).json({ message: 'Failed to approve enquiry' });
  }
};

// Admin: reject enquiry
exports.rejectEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const updated = await Enquiry.findByIdAndUpdate(
      id,
      { status: 'rejected', approvedBy: req.user._id, adminNotes: adminNotes || '' },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(updated);
  } catch (err) {
    console.error('rejectEnquiry error:', err);
    res.status(500).json({ message: 'Failed to reject enquiry' });
  }
};