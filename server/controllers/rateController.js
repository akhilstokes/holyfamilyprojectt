const Rate = require("../models/rateModel");
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const ifValidId = (v) => (mongoose.Types.ObjectId.isValid(v) ? v : undefined);

// Manager/Admin: Propose a new rate (goes to pending). Admin can later verify to publish
// @route POST /api/rates/update (back-compat) or /api/rates/propose
// body: { companyRate: number, marketRate: number, effectiveDate?: 'YYYY-MM-DD', product?: 'latex60', notes?: string }
exports.updateRate = async (req, res) => {
  try {
    const { marketRate, companyRate, source, effectiveDate, product, notes } = req.body;

    if (marketRate == null || companyRate == null) {
      return res.status(400).json({ message: "Both marketRate and companyRate are required" });
    }

    const doc = new Rate({
      marketRate,
      companyRate,
      source: source || 'manual',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      product: product || 'latex60',
      status: 'pending',
      ...(ifValidId(req.user?._id) ? { createdBy: req.user._id, updatedBy: req.user._id } : {}),
      notes: notes || ''
    });

    await doc.save();
    return res.status(201).json({ message: "Rate proposed successfully (pending verification)", rate: doc });
  } catch (error) {
    return res.status(500).json({ message: "Error updating rate", error: error.message });
  }
};

// Alias for clarity
exports.proposeRate = exports.updateRate;

// Get the latest rate by product (default latex60)
// @route GET /api/rates/latest?product=latex60
exports.getLatestRate = async (req, res) => {
  try {
    const product = req.query.product || 'latex60';
    const rate = await Rate.findOne({ product }).sort({ effectiveDate: -1, createdAt: -1 });
    if (!rate) {
      return res.status(404).json({ message: "No rates found" });
    }
    return res.json(rate);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching latest rate", error: error.message });
  }
};

// Public: Latest published rate only (visible to users/staff)
// @route GET /api/rates/published/latest?product=latex60
exports.getPublishedLatest = async (req, res) => {
  try {
    const product = req.query.product || 'latex60';
    const rate = await Rate.findOne({ product, status: 'published' }).sort({ effectiveDate: -1, createdAt: -1 });
    if (!rate) return res.status(404).json({ message: 'No published rates found' });
    return res.json(rate);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching published latest rate', error: error.message });
  }
};

// Get company rate for billing
// @route GET /api/rates/company
exports.getCompanyRate = async (req, res) => {
  try {
    const product = req.query.product || 'latex60';
    const rate = await Rate.findOne({ product, status: 'published' }).sort({ effectiveDate: -1, createdAt: -1 });
    if (!rate) {
      return res.json({ rate: 0, message: 'No company rate found' });
    }
    return res.json({ rate: rate.companyRate || 0 });
  } catch (error) {
    console.error('Error fetching company rate:', error);
    return res.status(500).json({ message: 'Error fetching company rate', error: error.message });
  }
};

// Update company rate (Admin/Manager only)
// @route PUT /api/rates/company
exports.updateCompanyRate = async (req, res) => {
  try {
    const { rate } = req.body;
    if (rate == null || rate <= 0) {
      return res.status(400).json({ message: 'Valid rate is required' });
    }

    const product = req.query.product || 'latex60';
    
    // Create a new rate entry with the updated company rate
    const newRate = new Rate({
      product,
      companyRate: rate,
      marketRate: 0, // Will be updated separately
      source: 'manual',
      effectiveDate: new Date(),
      status: 'published',
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
      notes: 'Company rate updated for billing'
    });

    await newRate.save();
    return res.json({ message: 'Company rate updated successfully', rate: newRate.companyRate });
  } catch (error) {
    console.error('Error updating company rate:', error);
    return res.status(500).json({ message: 'Error updating company rate', error: error.message });
  }
};

// Admin/Manager: Edit a proposed rate (resets to pending)
// @route PUT /api/rates/:id
exports.editRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { marketRate, companyRate, effectiveDate, product, notes } = req.body || {};
    const rate = await Rate.findById(id);
    if (!rate) return res.status(404).json({ message: 'Rate not found' });

    if (marketRate != null) rate.marketRate = marketRate;
    if (companyRate != null) rate.companyRate = companyRate;
    if (effectiveDate) rate.effectiveDate = new Date(effectiveDate);
    if (product) rate.product = product;
    if (notes !== undefined) rate.notes = notes;
    rate.status = 'pending';
    if (ifValidId(req.user?._id)) rate.updatedBy = req.user._id;
    rate.verifiedBy = null;
    rate.verifiedAt = null;

    await rate.save();
    return res.json({ message: 'Rate updated (pending verification)', rate });
  } catch (error) {
    return res.status(500).json({ message: 'Error editing rate', error: error.message });
  }
};

// Admin: Verify and publish a pending rate
// @route POST /api/rates/:id/verify
exports.verifyRate = async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await Rate.findById(id);
    if (!rate) return res.status(404).json({ message: 'Rate not found' });

    rate.status = 'published';
    if (ifValidId(req.user?._id)) rate.verifiedBy = req.user._id;
    rate.verifiedAt = new Date();
    await rate.save();

    return res.json({ message: 'Rate verified and published', rate });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying rate', error: error.message });
  }
};

// Admin/Manager: List pending rates
// @route GET /api/rates/pending?product=latex60
exports.getPendingRates = async (req, res) => {
  try {
    const product = req.query.product || 'latex60';
    const list = await Rate.find({ product, status: 'pending' }).sort({ effectiveDate: -1, createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching pending rates', error: error.message });
  }
};

// Get all rates (history) - Admin (filter by product)
// @route GET /api/rates/history?product=latex60
exports.getAllRates = async (req, res) => {
  try {
    const product = req.query.product || 'latex60';
    const rates = await Rate.find({ product }).sort({ effectiveDate: -1, createdAt: -1 });
    return res.json(rates);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching rates", error: error.message });
  }
};

// Public: Get recent rate history (no auth)
// @route GET /api/rates/public-history?product=latex60&limit=30
exports.getPublicRates = async (req, res) => {
  try {
    const product = req.query.product || 'latex60';
    const limit = Number(req.query.limit) || 30;
    const rates = await Rate.find({ product }).sort({ effectiveDate: -1, createdAt: -1 }).limit(limit);
    return res.json(rates);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching public rates", error: error.message });
  }
};

// User/Admin: Get rate history by date range (inclusive) for a product
// @route GET /api/rates/history-range?from=2024-01-01&to=2024-01-31&product=latex60
exports.getRatesByDateRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    const product = req.query.product || 'latex60';

    if (!from || !to) {
      return res.status(400).json({ message: 'from and to query params are required (YYYY-MM-DD)' });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Include the entire 'to' day by setting to 23:59:59.999
    toDate.setHours(23, 59, 59, 999);

    const rates = await Rate.find({
      product,
      effectiveDate: { $gte: fromDate, $lte: toDate },
    }).sort({ effectiveDate: -1, createdAt: -1 });

    return res.json(rates);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching rate history', error: error.message });
  }
};

// Fetch live Latex(60%) rate from Rubber Board website
// @route GET /api/rates/live/latex
exports.fetchLatexRateRubberBoard = async (req, res) => {
  try {
    const candidateUrls = [
      'https://rubberboard.gov.in',
      'https://rubberboard.org.in/public?lang=E',
      'https://rubberboard.org.in/public'
    ];

    let html = null;
    let fetchedUrl = null;

    // Try multiple possible URLs (site sometimes changes)
    for (const url of candidateUrls) {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        if (response.status === 200 && typeof response.data === 'string') {
          html = response.data;
          fetchedUrl = url;
          break;
        }
      } catch (_) {
        // try next url
      }
    }

    if (!html) {
      return res.status(502).json({ message: 'Unable to fetch Rubber Board page' });
    }

    const $ = cheerio.load(html);

    // Find the table row containing 'Latex(60%)'
    let latexRow = null;
    $('tr').each((_, el) => {
      const text = $(el).text().trim();
      if (/latex\s*\(60\%?\)/i.test(text)) {
        latexRow = $(el);
        return false; // break
      }
    });

    if (!latexRow || latexRow.length === 0) {
      return res.status(404).json({ message: 'Latex(60%) row not found on source page', source: fetchedUrl });
    }

    // Attempt to read headers from the same table
    const table = latexRow.closest('table');
    let headers = [];
    if (table.length) {
      const headerRow = table.find('thead tr').first().length ? table.find('thead tr').first() : table.find('tr').first();
      headers = headerRow.find('th,td').map((i, th) => $(th).text().trim().replace(/\s+/g, ' ')).get();
    }

    // Extract numeric values from the latex row (INR and possibly USD values)
    const cells = latexRow.find('td,th').map((i, td) => $(td).text().trim()).get();
    const numeric = cells
      .map((t) => {
        const cleaned = t.replace(/[₹,]/g, '');
        const m = cleaned.match(/-?\d+(?:\.\d+)?/);
        return m ? parseFloat(m[0]) : null;
      })
      .filter((v) => v !== null);

    // Heuristic mapping to markets if available in order
    const markets = {};
    const knownMarkets = ['Kottayam', 'Kochi', 'Agartala', 'USD'];
    knownMarkets.forEach((mkt, idx) => {
      if (numeric[idx] != null) markets[mkt] = numeric[idx];
    });

    // Try to detect the 'as on' date from page text
    const pageText = $('body').text();
    const dateMatch = pageText.match(/on\s+(\d{1,2}-\d{1,2}-\d{4})/i);
    const asOnDate = dateMatch ? dateMatch[1] : null;

    return res.json({
      source: fetchedUrl,
      asOnDate,
      product: 'Latex(60%)',
      unit: 'per 100 Kg',
      headers,
      numeric,
      markets
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch latex rate', error: error.message });
  }
};

// Combined: Admin latest company rate + Rubber Board live rate
// @route GET /api/rates/latex/today?product=latex60
exports.getLatexToday = async (req, res) => {
  try {
    const product = req.query.product || 'latex60';

    // 1) Fetch Rubber Board live
    const candidateUrls = [
      'https://rubberboard.gov.in',
      'https://rubberboard.org.in/public?lang=E',
      'https://rubberboard.org.in/public'
    ];

    let html = null;
    let fetchedUrl = null;

    for (const url of candidateUrls) {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        if (response.status === 200 && typeof response.data === 'string') {
          html = response.data;
          fetchedUrl = url;
          break;
        }
      } catch (_) {}
    }

    if (!html) {
      return res.status(502).json({ message: 'Unable to fetch Rubber Board page' });
    }

    const $ = cheerio.load(html);

    let latexRow = null;
    $('tr').each((_, el) => {
      const text = $(el).text().trim();
      if (/latex\s*\(60\%?\)/i.test(text)) {
        latexRow = $(el);
        return false;
      }
    });

    if (!latexRow || latexRow.length === 0) {
      return res.status(404).json({ message: 'Latex(60%) row not found on source page', source: fetchedUrl });
    }

    const table = latexRow.closest('table');
    let headers = [];
    if (table.length) {
      const headerRow = table.find('thead tr').first().length ? table.find('thead tr').first() : table.find('tr').first();
      headers = headerRow.find('th,td').map((i, th) => $(th).text().trim().replace(/\s+/g, ' ')).get();
    }

    const cells = latexRow.find('td,th').map((i, td) => $(td).text().trim()).get();
    const numeric = cells
      .map((t) => {
        const cleaned = t.replace(/[₹,]/g, '');
        const m = cleaned.match(/-?\d+(?:\.\d+)?/);
        return m ? parseFloat(m[0]) : null;
      })
      .filter((v) => v !== null);

    const markets = {};
    const knownMarkets = ['Kottayam', 'Kochi', 'Agartala', 'USD'];
    knownMarkets.forEach((mkt, idx) => {
      if (numeric[idx] != null) markets[mkt] = numeric[idx];
    });

    const pageText = $('body').text();
    const dateMatch = pageText.match(/on\s+(\d{1,2}-\d{1,2}-\d{4})/i);
    const asOnDate = dateMatch ? dateMatch[1] : null;

    // 2) Fetch Admin latest
    const latest = await Rate.findOne({ product }).sort({ effectiveDate: -1, createdAt: -1 });

    return res.json({
      product,
      unit: 'per 100 Kg',
      admin: latest
        ? { companyRate: latest.companyRate, marketRate: latest.marketRate, effectiveDate: latest.effectiveDate }
        : null,
      market: {
        productLabel: 'Latex(60%)',
        source: fetchedUrl,
        asOnDate,
        headers,
        markets
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch combined latex data', error: error.message });
  }
};

// Combined: Admin latest company rate + Rubber Board live rate
// @route GET /api/rates/latex/today?product=latex60
exports.getLatexToday = async (req, res) => {
  try {
    const product = req.query.product || 'latex60';

    // 1) Fetch Rubber Board live
    const candidateUrls = [
      'https://rubberboard.gov.in',
      'https://rubberboard.org.in/public?lang=E',
      'https://rubberboard.org.in/public'
    ];

    let html = null;
    let fetchedUrl = null;

    for (const url of candidateUrls) {
      try {
        const response = await axios.get(url, { timeout: 10000 });
        if (response.status === 200 && typeof response.data === 'string') {
          html = response.data;
          fetchedUrl = url;
          break;
        }
      } catch (_) {}
    }

    if (!html) {
      return res.status(502).json({ message: 'Unable to fetch Rubber Board page' });
    }

    const $ = cheerio.load(html);

    let latexRow = null;
    $('tr').each((_, el) => {
      const text = $(el).text().trim();
      if (/latex\s*\(60\%?\)/i.test(text)) {
        latexRow = $(el);
        return false;
      }
    });

    if (!latexRow || latexRow.length === 0) {
      return res.status(404).json({ message: 'Latex(60%) row not found on source page', source: fetchedUrl });
    }

    const table = latexRow.closest('table');
    let headers = [];
    if (table.length) {
      const headerRow = table.find('thead tr').first().length ? table.find('thead tr').first() : table.find('tr').first();
      headers = headerRow.find('th,td').map((i, th) => $(th).text().trim().replace(/\s+/g, ' ')).get();
    }

    const cells = latexRow.find('td,th').map((i, td) => $(td).text().trim()).get();
    const numeric = cells
      .map((t) => {
        const cleaned = t.replace(/[₹,]/g, '');
        const m = cleaned.match(/-?\d+(?:\.\d+)?/);
        return m ? parseFloat(m[0]) : null;
      })
      .filter((v) => v !== null);

    const markets = {};
    const knownMarkets = ['Kottayam', 'Kochi', 'Agartala', 'USD'];
    knownMarkets.forEach((mkt, idx) => {
      if (numeric[idx] != null) markets[mkt] = numeric[idx];
    });

    const pageText = $('body').text();
    const dateMatch = pageText.match(/on\s+(\d{1,2}-\d{1,2}-\d{4})/i);
    const asOnDate = dateMatch ? dateMatch[1] : null;

    // 2) Fetch Admin latest
    const latest = await Rate.findOne({ product }).sort({ effectiveDate: -1, createdAt: -1 });

    return res.json({
      product,
      unit: 'per 100 Kg',
      admin: latest
        ? { companyRate: latest.companyRate, marketRate: latest.marketRate, effectiveDate: latest.effectiveDate }
        : null,
      market: {
        productLabel: 'Latex(60%)',
        source: fetchedUrl,
        asOnDate,
        headers,
        markets
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch combined latex data', error: error.message });
  }
};
