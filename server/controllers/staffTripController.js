const StaffTrip = require('../models/StaffTrip');

// POST /api/staff/trips
exports.createTrip = async (req, res) => {
  try {
    const { routeName, date, stops, vehicleId } = req.body;
    const staffId = req.user?._id;

    if (!routeName || !date) {
      return res.status(400).json({ message: 'routeName and date are required' });
    }

    const trip = await StaffTrip.create({ routeName, date, staffId, vehicleId, stops: stops || [] });
    return res.status(201).json({ trip });
  } catch (err) {
    console.error('createTrip error', err);
    return res.status(500).json({ message: 'Failed to create trip' });
  }
};

// GET /api/staff/trips?date=YYYY-MM-DD
exports.listTrips = async (req, res) => {
  try {
    const { date } = req.query;
    const staffId = req.user?._id;

    const q = { };
    if (date) q.date = date;
    if (staffId) q.staffId = staffId;

    const trips = await StaffTrip.find(q).sort({ createdAt: -1 });
    return res.json({ trips });
  } catch (err) {
    console.error('listTrips error', err);
    return res.status(500).json({ message: 'Failed to list trips' });
  }
};

// GET /api/staff/trips/:id
exports.getTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await StaffTrip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    return res.json({ trip });
  } catch (err) {
    console.error('getTrip error', err);
    return res.status(500).json({ message: 'Failed to get trip' });
  }
};

// PATCH /api/staff/trips/:id/stops/:stopId/status
exports.updateStopStatus = async (req, res) => {
  try {
    const { id, stopId } = req.params;
    const { status, inventoryFileName, notes, proofUrl, eta } = req.body || {};

    const trip = await StaffTrip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const stop = trip.stops.id(stopId);
    if (!stop) return res.status(404).json({ message: 'Stop not found' });

    if (status) stop.status = status;
    if (inventoryFileName !== undefined) stop.inventoryFileName = inventoryFileName;
    if (notes !== undefined) stop.notes = notes;
    if (proofUrl !== undefined) stop.proofUrl = proofUrl;
    if (eta !== undefined) stop.eta = eta;

    await trip.save();

    return res.json({ stop });
  } catch (err) {
    console.error('updateStopStatus error', err);
    return res.status(500).json({ message: 'Failed to update stop status' });
  }
};
