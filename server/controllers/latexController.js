const LatexRequest = require('../models/latexRequestModel');
const User = require('../models/userModel');

// Submit latex sell request
const submitLatexRequest = async (req, res) => {
    try {
        const { quantity, drcPercentage, quality, location, notes, estimatedPayment } = req.body;
        const userId = req.user._id;

        // Validate required fields (DRC optional)
        if (!quantity || !location) {
            return res.status(400).json({
                success: false,
                message: 'Quantity and location are required'
            });
        }

        // Validate DRC percentage if provided
        if (drcPercentage !== undefined && drcPercentage !== null && (drcPercentage < 0 || drcPercentage > 100)) {
            return res.status(400).json({
                success: false,
                message: 'DRC percentage must be between 0 and 100'
            });
        }

        // Create new latex request
        const latexRequest = new LatexRequest({
            user: userId,
            quantity: parseFloat(quantity),
            drcPercentage: drcPercentage !== undefined && drcPercentage !== null ? parseFloat(drcPercentage) : 0,
            quality,
            location,
            notes,
            estimatedPayment: parseFloat(estimatedPayment),
            status: 'pending',
            submittedAt: new Date()
        });

        await latexRequest.save();

        res.status(201).json({
            success: true,
            message: 'Latex sell request submitted successfully',
            request: latexRequest
        });

    } catch (error) {
        console.error('Error submitting latex request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// POST /api/latex/manual-test
// Create a manual DRC test record from lab with minimal fields
const createManualTest = async (req, res) => {
    try {
        // ✅ Validate user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User authentication required' });
        }

        const { externalSampleId, buyerName, quantityLiters, drcPercentage, barrelCount } = req.body || {};
        if (!externalSampleId || !String(externalSampleId).trim()) return res.status(400).json({ message: 'externalSampleId is required' });
        if (!buyerName || !String(buyerName).trim()) return res.status(400).json({ message: 'buyerName is required' });
        const qty = Number(quantityLiters);
        if (!(qty > 0)) return res.status(400).json({ message: 'quantityLiters must be > 0' });
        const drc = Number(drcPercentage);
        if (!(drc >= 0 && drc <= 100)) return res.status(400).json({ message: 'drcPercentage must be between 0 and 100' });
        let bc = undefined;
        if (barrelCount !== undefined && barrelCount !== null && barrelCount !== '') {
            const bcn = Number(barrelCount);
            if (!Number.isInteger(bcn) || bcn < 0) return res.status(400).json({ message: 'barrelCount must be a positive integer' });
            bc = bcn;
        }
        const doc = new LatexRequest({
            user: req.user._id, // ✅ Required field
            externalSampleId: String(externalSampleId).trim(),
            overrideBuyerName: String(buyerName).trim(),
            quantity: qty,
            drcPercentage: drc,
            barrelCount: bc ?? 0,
            // Provide minimal required defaults for strict schema fields
            quality: 'standard',
            location: 'lab',
            contactNumber: '-',
            currentRate: 0,
            estimatedPayment: 0,
            // Testing status
            testCompletedAt: new Date(),
            testedBy: req.user._id,
            status: 'TEST_COMPLETED',
        });
        await doc.save();
        return res.status(201).json({ success: true, request: doc });
    } catch (e) {
        console.error('createManualTest error:', e);
        return res.status(500).json({ message: 'Failed to create manual test', error: e.message });
    }
};
// GET /api/latex/reports/drc?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns completed tests between dates inclusive
const getDrcReport = async (req, res) => {
    try {
        const { from, to } = req.query || {};
        const q = { status: { $in: ['TEST_COMPLETED', 'ACCOUNT_CALCULATED', 'VERIFIED', 'paid'] } };
        if (from || to) {
            q.testCompletedAt = {};
            if (from) q.testCompletedAt.$gte = new Date(from + 'T00:00:00.000Z');
            if (to) q.testCompletedAt.$lte = new Date(to + 'T23:59:59.999Z');
        }
        const items = await LatexRequest.find(q)
            .sort({ testCompletedAt: -1 })
            .limit(1000)
            .populate('user', 'name email')
            .lean();
        const rows = items.map(doc => ({
            analyzedAt: doc.testCompletedAt,
            sampleId: String(doc._id),
            supplier: doc.overrideBuyerName || doc.user?.name || doc.user?.email || '-',
            batch: doc.batch || '-',
            quantityLiters: doc.quantity,
            drc: doc.drcPercentage
        }));
        return res.json({ items: rows });
    } catch (e) {
        console.error('getDrcReport error:', e);
        return res.status(500).json({ message: 'Failed to load report' });
    }
};

// GET /api/latex/admin/pending-accounts
// List samples ready for accountant (after test completed)
const listPendingAccounts = async (req, res) => {
    try {
        const items = await LatexRequest.find({ status: 'TEST_COMPLETED' })
            .sort({ testCompletedAt: -1 })
            .populate('user', 'name email')
            .lean();
        return res.json({ records: items });
    } catch (e) {
        console.error('listPendingAccounts error:', e);
        return res.status(500).json({ message: 'Failed to load pending accounts items' });
    }
};

// GET /api/latex/pending-tests
// List requests waiting for DRC test (status COLLECTED)
const listPendingTests = async (req, res) => {
    try {
        const items = await LatexRequest.find({ status: 'COLLECTED' })
            .sort({ createdAt: -1 })
            .limit(200)
            .populate('user', 'name email phoneNumber')
            .lean();
        return res.json({ success: true, items });
    } catch (e) {
        console.error('listPendingTests error:', e);
        return res.status(500).json({ message: 'Failed to load pending tests' });
    }
};

// Get user's latex requests
const getUserLatexRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        let query = { user: userId };
        if (status) {
            query.status = status;
        }

        const requests = await LatexRequest.find(query)
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'name email');

        const total = await LatexRequest.countDocuments(query);

        res.status(200).json({
            success: true,
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error('Error fetching latex requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching latex requests'
        });
    }
};

// Get single latex request
const getLatexRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const request = await LatexRequest.findOne({ _id: id, user: userId })
            .populate('user', 'name email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Latex request not found'
            });
        }

        res.status(200).json({
            success: true,
            request
        });

    } catch (error) {
        console.error('Error fetching latex request:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching latex request'
        });
    }
};

// Update latex request (for admin)
const updateLatexRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actualPayment, adminNotes, quality, contactNumber, currentRate } = req.body || {};

        const request = await LatexRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Latex request not found'
            });
        }

        // Update fields only if provided
        if (status) {
            const allowed = ['pending', 'COLLECTED', 'TEST_COMPLETED', 'ACCOUNT_CALCULATED', 'VERIFIED', 'approved', 'rejected', 'paid', 'cancelled'];
            if (!allowed.includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status value' });
            }
            request.status = status;
        }
        if (actualPayment !== undefined) request.finalPayment = parseFloat(actualPayment);
        if (adminNotes !== undefined) request.notes = adminNotes;

        // Update optional fields if provided
        if (quality !== undefined) {
            const validQualities = ['premium', 'standard', 'average'];
            if (!validQualities.includes(quality)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quality value. Must be one of: ${validQualities.join(', ')}`
                });
            }
            request.quality = quality;
        }
        if (contactNumber !== undefined) request.contactNumber = contactNumber;
        if (currentRate !== undefined) request.currentRate = parseFloat(currentRate);

        if (status === 'approved' || status === 'rejected') {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ success: false, message: 'Unauthorized: user missing' });
            }
            request.approvedAt = new Date();
            request.approvedBy = req.user._id;
        }

        if (status === 'paid') {
            request.paidAt = new Date();
        }

        // Save with validation
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Latex request updated successfully',
            request
        });

    } catch (error) {
        console.error('Error updating latex request:', error);
        const msg = error?.message || 'Error updating latex request';
        // Mongoose validation errors -> 400
        if (error?.name === 'ValidationError') {
            // Provide more detailed error message
            const errors = Object.keys(error.errors).map(key => {
                const err = error.errors[key];
                if (err.kind === 'required') {
                    return `${key} is required`;
                } else if (err.kind === 'enum') {
                    return `${key}: "${err.value}" is not valid. Valid values are: ${err.properties.enumValues.join(', ')}`;
                }
                return err.message;
            });
            return res.status(400).json({ success: false, message: errors.join('; ') });
        }
        res.status(500).json({ success: false, message: msg });
    }
};

// Get all latex requests (for admin)
const getAllLatexRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const requests = await LatexRequest.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'name email phoneNumber')
            .populate('approvedBy', 'name');

        const total = await LatexRequest.countDocuments(query);

        // Calculate statistics
        const stats = await LatexRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalPayment: { $sum: '$estimatedPayment' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            records: requests, // Changed from 'requests' to 'records' to match frontend expectation
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats
        });

    } catch (error) {
        console.error('Error fetching all latex requests:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching latex requests',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Generate receipt for approved request
const generateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const request = await LatexRequest.findOne({ _id: id, user: userId })
            .populate('user', 'name email phone address');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Latex request not found'
            });
        }

        if (request.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Receipt can only be generated for approved requests'
            });
        }

        // Generate receipt data
        const receiptData = {
            receiptNumber: `LATEX-${request._id.toString().slice(-8).toUpperCase()}`,
            date: request.processedAt || request.submittedAt,
            customer: {
                name: request.user.name,
                email: request.user.email,
                phone: request.user.phone,
                address: request.user.address
            },
            request: {
                quantity: request.quantity,
                drcPercentage: request.drcPercentage,
                quality: request.quality,
                location: request.location,
                estimatedPayment: request.estimatedPayment,
                actualPayment: request.actualPayment || request.estimatedPayment
            },
            company: {
                name: 'Holy Family Polymers',
                address: 'Your Company Address',
                phone: 'Your Company Phone',
                email: 'info@holyfamilypolymers.com'
            }
        };

        res.status(200).json({
            success: true,
            receipt: receiptData
        });

    } catch (error) {
        console.error('Error generating receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating receipt'
        });
    }
};

// Test endpoint to check if server is working
const testEndpoint = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Latex controller is working',
            timestamp: new Date(),
            user: req.user ? req.user.name : 'No user'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Test endpoint error',
            error: error.message
        });
    }
};

// Note: Export ALL handlers together to avoid undefined destructures in routes

// 
// Workflow Controllers
// 

// PUT /api/latex/collect/:id
// Mark request as collected at yard
const collectLatex = async (req, res) => {
    try {
        const { id } = req.params;
        const { collectionDate, collectionLocation, collectionNotes } = req.body;
        const doc = await LatexRequest.findById(id);
        if (!doc) return res.status(404).json({ message: 'Latex request not found' });
        doc.collectionDate = collectionDate ? new Date(collectionDate) : new Date();
        if (collectionLocation) doc.collectionLocation = collectionLocation;
        if (collectionNotes) doc.collectionNotes = collectionNotes;
        doc.collectedBy = req.user._id;
        doc.status = 'COLLECTED';
        await doc.save();
        return res.json({ success: true, request: doc });
    } catch (e) {
        console.error('collectLatex error:', e);
        return res.status(500).json({ message: 'Failed to update collection status' });
    }
};

// PUT /api/latex/test/:id
// Record DRC% test result
const recordTestResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { drcPercentage, barrels, overrideBuyerName, barrelCount } = req.body || {};
        const doc = await LatexRequest.findById(id);
        if (!doc) return res.status(404).json({ message: 'Latex request not found' });
        // Support per-barrel input
        if (Array.isArray(barrels) && barrels.length) {
            // sanitize
            const clean = barrels
                .map(b => ({ drc: Number(b.drc), liters: b.liters != null ? Number(b.liters) : null }))
                .filter(b => Number.isFinite(b.drc));
            if (!clean.length) return res.status(400).json({ message: 'Invalid barrels array' });
            doc.barrels = clean;
            // weighted by liters if present
            const totalLiters = clean.reduce((sum, b) => sum + (Number.isFinite(b.liters) ? b.liters : 0), 0);
            let avg = 0;
            if (totalLiters > 0) {
                avg = clean.reduce((sum, b) => sum + b.drc * (Number.isFinite(b.liters) ? b.liters : 0), 0) / totalLiters;
            } else {
                avg = clean.reduce((sum, b) => sum + b.drc, 0) / clean.length;
            }
            doc.drcPercentage = Number(avg.toFixed(2));
        } else {
            if (drcPercentage === undefined || drcPercentage === null) {
                return res.status(400).json({ message: 'drcPercentage or barrels[] is required' });
            }
            doc.drcPercentage = Number(drcPercentage);
        }
        // Optional lab-captured fields
        if (overrideBuyerName !== undefined) doc.overrideBuyerName = String(overrideBuyerName || '');
        if (barrelCount !== undefined && barrelCount !== null && barrelCount !== '') {
            const bc = Number(barrelCount);
            if (Number.isFinite(bc) && bc >= 0) doc.barrelCount = bc;
        }

        doc.testCompletedAt = new Date();
        doc.testedBy = req.user._id;
        doc.status = 'TEST_COMPLETED';
        await doc.save();
        return res.json({ success: true, request: doc });
    } catch (e) {
        console.error('recordTestResult error:', e);
        return res.status(500).json({ message: 'Failed to save test result' });
    }
};

// PUT /api/latex/admin/calc/:id
// Accountant calculates amount using formula: quantity(L) * (drc/100) * marketRate
const accountantCalculate = async (req, res) => {
    try {
        const { id } = req.params;
        const { marketRate } = req.body;
        if (marketRate === undefined || marketRate === null) {
            return res.status(400).json({ message: 'marketRate is required' });
        }
        const doc = await LatexRequest.findById(id);
        if (!doc) return res.status(404).json({ message: 'Latex request not found' });
        const drc = Number(doc.drcPercentage || 0);
        const qty = Number(doc.quantity || 0);
        const rate = Number(marketRate);
        const dryKg = qty * (drc / 100);
        const amount = Math.round(dryKg * rate);
        doc.marketRate = rate;
        doc.calculatedAmount = amount;
        doc.accountCalculatedAt = new Date();
        doc.accountCalculatedBy = req.user._id;
        doc.status = 'ACCOUNT_CALCULATED';
        await doc.save();
        return res.json({ success: true, request: doc, calc: { qtyLiters: qty, drcPercent: drc, dryKg, rate, amount } });
    } catch (e) {
        console.error('accountantCalculate error:', e);
        return res.status(500).json({ message: 'Failed to calculate amount' });
    }
};

// Helper function to get DRC-based rate tier
function getDRCBasedRate(drcPercentage, baseCompanyRate) {
    const drc = Number(drcPercentage || 0);
    const baseRate = Number(baseCompanyRate || 9000);

    // DRC-based pricing tiers
    if (drc >= 60) {
        // Premium quality: Full company rate
        return baseRate;
    } else if (drc >= 50) {
        // Good quality: 83% of company rate
        return Math.round(baseRate * 0.83);
    } else if (drc >= 40) {
        // Average quality: 67% of company rate
        return Math.round(baseRate * 0.67);
    } else {
        // Low quality: 50% of company rate
        return Math.round(baseRate * 0.50);
    }
}

// PUT /api/latex/admin/calc-company-rate/:id
// Accountant calculates amount using company rate automatically with DRC-based pricing
const accountantCalculateWithCompanyRate = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await LatexRequest.findById(id);
        if (!doc) return res.status(404).json({ message: 'Latex request not found' });

        // Get the latest company rate (base rate for DRC 60%+)
        const Rate = require('../models/rateModel');
        const latestRate = await Rate.findOne({ status: 'published' }).sort({ effectiveDate: -1, createdAt: -1 });
        if (!latestRate || !latestRate.companyRate) {
            return res.status(400).json({ message: 'Company rate not found. Please set a company rate first.' });
        }

        const drc = Number(doc.drcPercentage || 0);
        const qty = Number(doc.quantity || 0);
        const baseCompanyRate = Number(latestRate.companyRate);

        // Get DRC-based rate (adjusted based on quality)
        const adjustedRate = getDRCBasedRate(drc, baseCompanyRate);

        const dryKg = qty * (drc / 100);
        const amount = Math.round(dryKg * adjustedRate);

        doc.marketRate = adjustedRate;
        doc.calculatedAmount = amount;
        doc.accountCalculatedAt = new Date();
        doc.accountCalculatedBy = req.user._id;
        doc.status = 'ACCOUNT_CALCULATED';
        await doc.save();

        return res.json({
            success: true,
            request: doc,
            calc: {
                qtyLiters: qty,
                drcPercent: drc,
                dryKg,
                baseRate: baseCompanyRate,
                adjustedRate: adjustedRate,
                amount
            },
            companyRate: baseCompanyRate,
            appliedRate: adjustedRate,
            rateTier: drc >= 60 ? 'Premium (100%)' :
                drc >= 50 ? 'Good (83%)' :
                    drc >= 40 ? 'Average (67%)' :
                        'Low (50%)'
        });
    } catch (e) {
        console.error('accountantCalculateWithCompanyRate error:', e);
        return res.status(500).json({ message: 'Failed to calculate amount with company rate' });
    }
};

// PUT /api/latex/admin/verify/:id
// Manager verifies the calculation and generates invoice metadata
const managerVerify = async (req, res) => {
    try {
        console.log('managerVerify called with:', { id: req.params.id, user: req.user });

        const { id } = req.params;
        const doc = await LatexRequest.findById(id).populate('user', 'name email');
        if (!doc) {
            console.log('Latex request not found:', id);
            return res.status(404).json({ message: 'Latex request not found' });
        }

        console.log('Found document:', {
            id: doc._id,
            calculatedAmount: doc.calculatedAmount,
            marketRate: doc.marketRate,
            status: doc.status
        });

        if (!doc.calculatedAmount || !doc.marketRate) {
            console.log('Calculation not completed:', { calculatedAmount: doc.calculatedAmount, marketRate: doc.marketRate });
            return res.status(400).json({ message: 'Calculation not completed yet' });
        }

        // Handle built-in tokens for verifiedBy
        let verifiedBy = null;
        if (req.user?._id) {
            if (typeof req.user._id === 'string' && req.user._id.startsWith('builtin-')) {
                // For built-in tokens, try to find the actual user
                const User = require('../models/userModel');
                const userDoc = await User.findOne({ staffId: req.user.staffId }).select('_id');
                verifiedBy = userDoc?._id || null;
            } else {
                verifiedBy = req.user._id;
            }
        }

        doc.verifiedAt = new Date();
        doc.verifiedBy = verifiedBy;
        doc.finalPayment = doc.calculatedAmount;
        doc.status = 'VERIFIED';
        // Simple invoice number: INV-<last8>
        doc.invoiceNumber = `INV-${String(doc._id).slice(-8).toUpperCase()}`;
        // Placeholder URL (can be replaced with real PDF service)
        doc.invoicePdfUrl = `/api/latex/invoice/${doc._id}`;

        console.log('Saving document with:', {
            verifiedAt: doc.verifiedAt,
            verifiedBy: doc.verifiedBy,
            status: doc.status,
            invoiceNumber: doc.invoiceNumber
        });

        await doc.save();
        console.log('Document saved successfully');

        return res.json({ success: true, request: doc });
    } catch (e) {
        console.error('managerVerify error:', e);
        console.error('Error stack:', e.stack);
        return res.status(500).json({ message: 'Failed to verify request', error: e.message });
    }
};

// GET /api/latex/invoice/:id
// Return invoice JSON (PDF generation can be integrated later)
const getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await LatexRequest.findById(id).populate('user', 'name email phoneNumber');
        if (!doc) return res.status(404).json({ message: 'Invoice not found' });
        if (doc.status !== 'VERIFIED') return res.status(400).json({ message: 'Invoice available only after verification' });
        const invoice = {
            number: doc.invoiceNumber || `INV-${String(doc._id).slice(-8).toUpperCase()}`,
            date: doc.verifiedAt || doc.updatedAt,
            buyer: {
                name: doc.user?.name,
                email: doc.user?.email,
                phone: doc.user?.phoneNumber,
            },
            request: {
                quantityLiters: doc.quantity,
                drcPercent: doc.drcPercentage,
                marketRate: doc.marketRate,
                dryKg: doc.quantity * (doc.drcPercentage / 100),
            },
            amount: doc.finalPayment,
            company: {
                name: 'Holy Family Polymers',
            }
        };
        return res.json({ success: true, invoice });
    } catch (e) {
        console.error('getInvoice error:', e);
        return res.status(500).json({ message: 'Failed to load invoice' });
    }
};









// Consolidated exports (ensure routes receive defined functions)
module.exports = {
    submitLatexRequest,
    getUserLatexRequests,
    getLatexRequest,
    updateLatexRequest,
    getAllLatexRequests,
    generateReceipt,
    testEndpoint,
    createManualTest,
    // Workflow
    collectLatex,
    recordTestResult,
    accountantCalculate,
    accountantCalculateWithCompanyRate,
    managerVerify,
    getInvoice,
    listPendingTests,
    // Reports and Accounts queue
    getDrcReport,
    listPendingAccounts,
};










































