const express = require('express');
const router = express.Router();
const {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    getExpenseStats
} = require('../controllers/expenseController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

// Public routes (accessible to all authenticated users)
router.get('/', getExpenses);
router.get('/stats', getExpenseStats);
router.post('/', createExpense);
router.get('/:id', getExpenseById);

// Routes accessible to expense creator, managers, and accountants
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

// Manager and Accountant only routes
router.put('/:id/approve', authorize(['manager', 'accountant']), approveExpense);
router.put('/:id/reject', authorize(['manager', 'accountant']), rejectExpense);

module.exports = router;