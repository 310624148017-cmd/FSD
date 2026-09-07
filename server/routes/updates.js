const express = require('express');
const {
  createUpdate,
  getUpdatesByContract,
  getUpdateById,
  editUpdate,
  deleteUpdate,
} = require('../controllers/cropUpdateController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();

router.post('/', protect, requireRole('farmer'), createUpdate);
router.get('/contract/:contractId', protect, getUpdatesByContract);
router.get('/:id', protect, getUpdateById);
router.put('/:id', protect, requireRole('farmer'), editUpdate);
router.delete('/:id', protect, requireRole('farmer'), deleteUpdate);

module.exports = router;
