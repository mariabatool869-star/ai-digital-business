const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCheckoutSession,
  verifySession,
  getMyOrders
} = require('../controllers/paymentController');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify/:sessionId', protect, verifySession);
router.get('/my-orders', protect, getMyOrders);

module.exports = router;
