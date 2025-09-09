 
const Barrel = require('../models/barrelModel');

// @desc    Add a new barrel to the system
// @route   POST /api/barrels
exports.addBarrel = async (req, res) => {
    const { barrelId, capacity } = req.body;
    try {
        const newBarrel = new Barrel({ barrelId, capacity, lastUpdatedBy: req.user._id });
        const savedBarrel = await newBarrel.save();
        res.status(201).json(savedBarrel);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a barrel's status, location, and volume
// @route   PUT /api/barrels/:id
exports.updateBarrel = async (req, res) => {
    try {
        const { currentVolume, status, lastKnownLocation } = req.body;
        const barrel = await Barrel.findById(req.params.id);
        if(!barrel) {
            return res.status(404).json({ message: "Barrel not found" });
        }
        barrel.currentVolume = currentVolume;
        barrel.status = status;
        barrel.lastKnownLocation = lastKnownLocation;
        barrel.lastUpdatedBy = req.user._id;

        const updatedBarrel = await barrel.save();
        res.status(200).json(updatedBarrel);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
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