const BarrelScrape = require('../models/barrelScrapeModel');
const Barrel = require('../models/barrelModel');

// @desc    Create a new scrape entry
// @route   POST /api/barrel-scrapes
exports.createScrape = async (req, res) => {
    try {
        const {
            barrelId,
            totalWeightKg,
            lumpRubberKg,
            moisturePercent,
            yieldPercent,
            notes = ''
        } = req.body;

        // Validate required fields
        if (!barrelId || !totalWeightKg || !lumpRubberKg) {
            return res.status(400).json({
                message: 'barrelId, totalWeightKg, and lumpRubberKg are required'
            });
        }

        // Find the barrel by barrelId
        const barrel = await Barrel.findOne({ barrelId });
        if (!barrel) {
            return res.status(404).json({ message: 'Barrel not found' });
        }

        // Create the scrape entry
        const scrape = new BarrelScrape({
            barrel: barrel._id,
            barrelId,
            totalWeightKg,
            lumpRubberKg,
            moisturePercent,
            yieldPercent,
            notes,
            createdBy: req.user._id
        });

        const savedScrape = await scrape.save();
        await savedScrape.populate('barrel', 'barrelId materialName');
        await savedScrape.populate('createdBy', 'name email');

        res.status(201).json(savedScrape);
    } catch (error) {
        console.error('Error creating scrape:', error);
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    List scrape entries with optional filtering
// @route   GET /api/barrel-scrapes
exports.listScrapes = async (req, res) => {
    try {
        const { barrelId, page = 1, limit = 10 } = req.query;

        let query = {};

        // Filter by barrelId if provided
        if (barrelId) {
            query.barrelId = barrelId;
        }

        // If user is not admin/manager, only show their own scrapes
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            query.createdBy = req.user._id;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: [
                { path: 'barrel', select: 'barrelId materialName status' },
                { path: 'createdBy', select: 'name email' }
            ]
        };

        // For now, using simple find instead of pagination
        // In production, you might want to add mongoose-paginate-v2
        const scrapes = await BarrelScrape.find(query)
            .sort({ createdAt: -1 })
            .populate('barrel', 'barrelId materialName status')
            .populate('createdBy', 'name email')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await BarrelScrape.countDocuments(query);

        res.json({
            scrapes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error listing scrapes:', error);
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};