const express = require('express');
const {
  createContract,
  getAgribusinessContracts,
  getOpenContracts,
  getFarmerContracts,
  getContractById,
  updateContract,
  acceptContract,
  declineContract,
  cancelContract,
  completeContract,
  deleteContract,
} = require('../controllers/contractController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();

// Agribusiness routes
router.post('/', protect, requireRole('agribusiness'), createContract);
router.get('/', protect, requireRole('agribusiness'), getAgribusinessContracts);

// Farmer routes
router.get('/open', protect, requireRole('farmer'), getOpenContracts);
router.get('/my', protect, requireRole('farmer'), getFarmerContracts);

// Shared (any authenticated)
router.get('/:id', protect, getContractById);

// Agribusiness mutations
router.put('/:id', protect, requireRole('agribusiness'), updateContract);
router.patch('/:id/cancel', protect, requireRole('agribusiness'), cancelContract);
router.patch('/:id/complete', protect, requireRole('agribusiness'), completeContract);
router.delete('/:id', protect, requireRole('agribusiness'), deleteContract);

// Farmer mutations
router.patch('/:id/accept', protect, requireRole('farmer'), acceptContract);
router.patch('/:id/decline', protect, requireRole('farmer'), declineContract);

module.exports = router;
