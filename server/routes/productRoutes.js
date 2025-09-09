const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
} = require('../controllers/productController');

// Public: list and get product
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin: manage products
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;