// server/controllers/dailyRateController.js
const DailyRate = require('../models/dailyRateModel');
const PDFDocument = require('pdfkit');

// Helper: IST now (UTC + 5:30) to enforce 4 PM rule reliably (no DST in IST)
function nowIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000);
}
function isPast4pmIST(d) {
  // After shifting to IST, using UTC getters equals IST local clock
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  return h > 16 || (h === 16 && m >= 0); // block from 16:00 onwards
}
// Normalize date to midnight (for uniqueness)
function atMidnight(dateStrOrDate) {
  const d = new Date(dateStrOrDate);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Admin: Add or Update (up to 4 PM IST)
exports.addOrUpdate = async (req, res) => {
  try {
    const { effectiveDate, category, inr, usd } = req.body;
    if (!effectiveDate || !category || inr == null || usd == null) {
      return res.status(400).json({ message: 'effectiveDate, category, inr, usd are required' });
    }

    if (isPast4pmIST(nowIST())) {
      return res.status(403).json({ message: 'Updates are allowed only before 4:00 PM IST' });
    }

    const eff = atMidnight(effectiveDate);
    const payload = {
      effectiveDate: eff,
      category: String(category).toUpperCase(),
      inr,
      usd,
      createdBy: req.user?._id || null,
      source: 'admin',
    };

    const doc = await DailyRate.findOneAndUpdate(
      { effectiveDate: eff, category: payload.category },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: 'Saved successfully', rate: doc });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to save rate', error: err.message });
  }
};

// Admin: Update by ID (still enforce 4 PM)
exports.updateById = async (req, res) => {
  try {
    if (isPast4pmIST(nowIST())) {
      return res.status(403).json({ message: 'Updates are allowed only before 4:00 PM IST' });
    }
    const { id } = req.params;
    const { effectiveDate, category, inr, usd } = req.body;

    const update = {};
    if (effectiveDate) update.effectiveDate = atMidnight(effectiveDate);
    if (category) update.category = String(category).toUpperCase();
    if (inr != null) update.inr = inr;
    if (usd != null) update.usd = usd;

    const doc = await DailyRate.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Updated', rate: doc });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update', error: err.message });
  }
};

// Public/User: Latest for a category
exports.getLatest = async (req, res) => {
  try {
    const category = (req.query.category || 'LATEX60').toUpperCase();
    const latest = await DailyRate.findOne({ category }).sort({ effectiveDate: -1, createdAt: -1 });
    if (!latest) return res.status(404).json({ message: 'No data' });
    return res.json(latest);
  } catch (err) {
    return res.status(500).json({ message: 'Failed', error: err.message });
  }
};

// Admin/User: History with filters
exports.getHistory = async (req, res) => {
  try {
    const rows = await exports.getHistoryInternal(req, res);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Failed', error: err.message });
  }
};

// Admin: Export CSV
exports.exportCsv = async (req, res) => {
  try {
    const rows = (await exports.getHistoryInternal(req, res)) || [];
    const header = 'Date,Category,INR,USD,Source\n';
    const body = rows
      .map((r) => {
        const d = new Date(r.effectiveDate);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return `${dateStr},${r.category},${r.inr},${r.usd},${r.source || ''}`;
      })
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="daily-rates.csv"');
    return res.send(header + body + '\n');
  } catch (err) {
    return res.status(500).json({ message: 'CSV export failed', error: err.message });
  }
};

// Admin: Export PDF (simple table)
exports.exportPdf = async (req, res) => {
  try {
    const rows = (await exports.getHistoryInternal(req, res)) || [];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="daily-rates.pdf"');

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    doc.fontSize(16).text('Daily Rubber Rates', { align: 'center' });
    doc.moveDown();

    // table header
    doc.fontSize(12).text('Date', 40, doc.y, { continued: true, width: 100 });
    doc.text('Category', 140, doc.y, { continued: true, width: 120 });
    doc.text('INR', 260, doc.y, { continued: true, width: 80 });
    doc.text('USD', 340, doc.y, { continued: true, width: 80 });
    doc.text('Source', 420, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    rows.forEach((r) => {
      const d = new Date(r.effectiveDate);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      doc.text(dateStr, 40, doc.y, { continued: true, width: 100 });
      doc.text(r.category, 140, doc.y, { continued: true, width: 120 });
      doc.text(String(r.inr), 260, doc.y, { continued: true, width: 80 });
      doc.text(String(r.usd), 340, doc.y, { continued: true, width: 80 });
      doc.text(r.source || '', 420, doc.y);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    return res.status(500).json({ message: 'PDF export failed', error: err.message });
  }
};

// Internal helper to share filter logic for export endpoints
exports.getHistoryInternal = async (req, res) => {
  const { from, to, category } = req.query;
  const q = {};
  if (category) q.category = String(category).toUpperCase();
  if (from || to) {
    q.effectiveDate = {};
    if (from) q.effectiveDate.$gte = atMidnight(from);
    if (to) {
      const t = atMidnight(to);
      t.setHours(23, 59, 59, 999);
      q.effectiveDate.$lte = t;
    }
  }
  return DailyRate.find(q).sort({ effectiveDate: -1, createdAt: -1 });
};