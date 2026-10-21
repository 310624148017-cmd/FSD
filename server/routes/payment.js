const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createCheckoutSession, handlePaymentSuccess } = require('../controllers/paymentController');

// All payment routes are restricted to Agribusiness users currently
router.use(protect);
router.use(requireRole('agribusiness'));

router.post('/create-checkout-session', createCheckoutSession);
router.post('/success', handlePaymentSuccess);

module.exports = router;
