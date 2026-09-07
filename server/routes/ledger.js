const express = require('express');
const {
  recordPayment,
  getContractLedger,
  getPaymentSummary,
  getAllPayments,
  updatePaymentStatus,
} = require('../controllers/ledgerController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();

router.post('/', protect, requireRole('agribusiness'), recordPayment);
router.get('/', protect, requireRole('agribusiness'), getAllPayments);
router.get('/contract/:contractId', protect, getContractLedger);
router.get('/summary/:contractId', protect, getPaymentSummary);
router.patch('/:id/status', protect, requireRole('agribusiness'), updatePaymentStatus);

module.exports = router;
