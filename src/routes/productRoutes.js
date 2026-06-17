const express = require('express');
const {
  getAllProducts,
  getProductsByType,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Public routes (anyone can view products)
router.get('/', getAllProducts);
router.get('/type/:type', getProductsByType);
router.get('/:id', getProductById);

// Admin only routes (only admins can add/update/delete)
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;