// Global middleware to enforce non-negative numeric inputs across APIs
// Skips enforcement for stock APIs as requested

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

function checkForNegativeNumbers(data, path = [], issues = []) {
  if (data == null) return issues;

  if (typeof data === 'number') {
    if (Number.isFinite(data) && data < 0) {
      issues.push(path.join('.'));
    }
    return issues;
  }

  if (Array.isArray(data)) {
    data.forEach((item, idx) => checkForNegativeNumbers(item, [...path, idx], issues));
    return issues;
  }

  if (isObject(data)) {
    Object.entries(data).forEach(([k, v]) => checkForNegativeNumbers(v, [...path, k], issues));
    return issues;
  }

  // Try to coerce numeric strings
  if (typeof data === 'string') {
    const n = Number(data);
    if (!Number.isNaN(n) && Number.isFinite(n) && n < 0) {
      issues.push(path.join('.'));
    }
  }
  return issues;
}

module.exports = function enforceNonNegativeNumbers(req, res, next) {
  // Skip for stock routes (both /api/stock and /api/admin/stock etc.)
  if (req.path.includes('/stock')) {
    return next();
  }

  const issues = [];
  checkForNegativeNumbers(req.body, ['body'], issues);
  checkForNegativeNumbers(req.query, ['query'], issues);

  if (issues.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Negative values are not allowed',
      fields: issues,
    });
  }
  return next();
};
