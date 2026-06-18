const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');

router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
