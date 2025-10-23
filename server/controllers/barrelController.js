 
const Barrel = require('../models/barrelModel');
const { evaluateAndFlag } = require('../services/lumbDetectionService');

// @desc    Add a new barrel to the system
// @route   POST /api/barrels
exports.addBarrel = async (req, res) => {
    try {
        let {
            barrelId,
            capacity,
            currentVolume = 0,
            status = 'in-storage',
            lastKnownLocation = '',
            notes = '',
            materialName = '',
            batchNo = '',
            manufactureDate,
            expiryDate,
            unit = 'L',
        } = req.body;

        // Basic validation and normalization
        barrelId = (barrelId || '').trim();
        materialName = (materialName || '').trim();
        batchNo = (batchNo || '').trim();
        lastKnownLocation = (lastKnownLocation || '').trim();
        unit = (unit || 'L').trim();
        if (!barrelId) {
            return res.status(400).json({ message: 'barrelId is required' });
        }
        const cap = Number(capacity);
        capacity = Number.isFinite(cap) && cap >= 1 ? cap : 1;

        const newBarrel = new Barrel({
            barrelId,
            capacity,
            currentVolume,
            status,
            lastKnownLocation,
            notes,
            materialName,
            batchNo,
            manufactureDate,
            expiryDate,
            unit,
            lastUpdatedBy: req.user?._id,
        });

        const savedBarrel = await newBarrel.save();
        return res.status(201).json(savedBarrel);
    } catch (error) {
        if (error && (error.code === 11000 || error.code === 11001)) {
            // Duplicate key error (unique index on barrelId)
            return res.status(409).json({ message: 'Barrel ID already exists' });
        }
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a barrel's status, location, and volume
// @route   PUT /api/barrels/:id
exports.updateBarrel = async (req, res) => {
    try {
        const { currentVolume, status, lastKnownLocation, materialName, batchNo, manufactureDate, expiryDate, unit, notes } = req.body;
        const barrel = await Barrel.findById(req.params.id);
        if(!barrel) {
            return res.status(404).json({ message: "Barrel not found" });
        }
        barrel.currentVolume = currentVolume;
        barrel.status = status;
        barrel.lastKnownLocation = lastKnownLocation;
        if (materialName !== undefined) barrel.materialName = materialName;
        if (batchNo !== undefined) barrel.batchNo = batchNo;
        if (manufactureDate !== undefined) barrel.manufactureDate = manufactureDate;
        if (expiryDate !== undefined) barrel.expiryDate = expiryDate;
        if (unit !== undefined) barrel.unit = unit;
        if (notes !== undefined) barrel.notes = notes;
        barrel.lastUpdatedBy = req.user._id;

        const updatedBarrel = await barrel.save();
        res.status(200).json(updatedBarrel);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    FEFO: Get next barrel to use (earliest expiry among in-storage/in-use with volume > 0)
// @route   GET /api/barrels/fefo/next
exports.getNextToUse = async (req, res) => {
    try {
        const next = await Barrel.find({
            status: { $in: ['in-storage', 'in-use'] },
            expiryDate: { $ne: null },
            currentVolume: { $gt: 0 },
        })
        .sort({ expiryDate: 1 })
        .limit(1);

        return res.json(next[0] || null);
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    FEFO: Get upcoming expiry queue
// @route   GET /api/barrels/fefo/queue
exports.getExpiryQueue = async (req, res) => {
    try {
        const list = await Barrel.find({
            status: { $in: ['in-storage', 'in-use'] },
            expiryDate: { $ne: null },
            currentVolume: { $gt: 0 },
        })
        .sort({ expiryDate: 1 })
        .select('barrelId materialName lastKnownLocation expiryDate');

        return res.json(list);
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    FEFO: Mark a barrel as in-use
// @route   POST /api/barrels/:id/mark-in-use
exports.markInUse = async (req, res) => {
    try {
        const barrel = await Barrel.findById(req.params.id);
        if (!barrel) return res.status(404).json({ message: 'Barrel not found' });
        barrel.status = 'in-use';
        barrel.lastUpdatedBy = req.user._id;
        const saved = await barrel.save();
        return res.json(saved);
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all barrels
// @route   GET /api/barrels
exports.getAllBarrels = async (req, res) => {
    try {
        const barrels = await Barrel.find({}).populate('lastUpdatedBy', 'name');
        res.status(200).json(barrels);
    } catch (error) {
         res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update base/empty weight; compute lumb% and flag if needed (Lab)
// @route   PUT /api/barrels/:id/weights
exports.updateWeights = async (req, res) => {
    try {
        const { baseWeight, emptyWeight } = req.body;
        const barrel = await Barrel.findById(req.params.id);
        if (!barrel) return res.status(404).json({ message: 'Barrel not found' });
        if (typeof baseWeight === 'number') barrel.baseWeight = baseWeight;
        if (typeof emptyWeight === 'number') barrel.emptyWeight = emptyWeight;

        await evaluateAndFlag(barrel, { userId: req.user._id, threshold: 20 });
        barrel.lastUpdatedBy = req.user._id;
        const saved = await barrel.save();
        return res.json(saved);
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update current location (Field/Lab)
// @route   PUT /api/barrels/:id/location
exports.setLocation = async (req, res) => {
    try {
        const { currentLocation, lastKnownLocation } = req.body;
        const barrel = await Barrel.findById(req.params.id);
        if (!barrel) return res.status(404).json({ message: 'Barrel not found' });
        if (currentLocation) barrel.currentLocation = currentLocation;
        if (lastKnownLocation) barrel.lastKnownLocation = lastKnownLocation;
        barrel.lastUpdatedBy = req.user._id;
        const saved = await barrel.save();
        return res.json(saved);
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update condition (Manager/Admin)
// @route   PUT /api/barrels/:id/condition
exports.setCondition = async (req, res) => {
    try {
        const { condition, damageType } = req.body;
        const barrel = await Barrel.findById(req.params.id);
        if (!barrel) return res.status(404).json({ message: 'Barrel not found' });
        if (condition) barrel.condition = condition;
        if (damageType) barrel.damageType = damageType;
        barrel.lastUpdatedBy = req.user._id;
        const saved = await barrel.save();
        return res.json(saved);
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};