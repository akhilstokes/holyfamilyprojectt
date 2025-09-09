const Barrel = require('../models/barrelModel');

// Simple linear prediction using last N readings
function linearFit(points) {
  // points: [{t: Number, y: Number}] where t is milliseconds
  if (points.length < 2) return null;
  const n = points.length;
  const sumT = points.reduce((a, p) => a + p.t, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumTT = points.reduce((a, p) => a + p.t * p.t, 0);
  const sumTY = points.reduce((a, p) => a + p.t * p.y, 0);
  const denom = n * sumTT - sumT * sumT;
  if (denom === 0) return null;
  const slope = (n * sumTY - sumT * sumY) / denom; // y per ms
  const intercept = (sumY - slope * sumT) / n;
  return { slope, intercept };
}

exports.addReading = async (req, res) => {
  try {
    const { id } = req.params; // barrel _id
    const { volume, timestamp } = req.body;
    if (volume == null || volume < 0) return res.status(400).json({ message: 'volume >= 0 required' });
    const barrel = await Barrel.findById(id);
    if (!barrel) return res.status(404).json({ message: 'Barrel not found' });

    barrel.readings.push({ volume, timestamp: timestamp ? new Date(timestamp) : new Date() });
    // keep only last 200 readings
    if (barrel.readings.length > 200) barrel.readings = barrel.readings.slice(-200);
    await barrel.save();
    return res.status(201).json({ message: 'Reading added', readings: barrel.readings });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.getPrediction = async (req, res) => {
  try {
    const { id } = req.params; // barrel _id
    const barrel = await Barrel.findById(id).lean();
    if (!barrel) return res.status(404).json({ message: 'Barrel not found' });
    const capacity = barrel.capacity || 0;
    const last = (barrel.readings || []).slice(-20); // last 20 points
    if (last.length < 2) return res.json({ capacity, etaToFullMinutes: null, trend: null });

    const pts = last.map(r => ({ t: new Date(r.timestamp).getTime(), y: Number(r.volume || 0) }));
    const fit = linearFit(pts);
    if (!fit) return res.json({ capacity, etaToFullMinutes: null, trend: null });

    // slope is liters per ms -> per minute
    const slopePerMin = fit.slope * 60 * 1000;
    const currentTs = Date.now();
    const currentVol = fit.slope * currentTs + fit.intercept;

    let etaToFullMinutes = null;
    if (slopePerMin > 0 && currentVol < capacity) {
      const minutes = (capacity - currentVol) / slopePerMin;
      etaToFullMinutes = Math.max(0, Math.round(minutes));
    }

    const trend = slopePerMin > 0 ? 'filling' : slopePerMin < 0 ? 'draining' : 'flat';
    return res.json({ capacity, etaToFullMinutes, trend, slopePerMin });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};