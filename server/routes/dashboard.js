const express = require('express');
const { farmerDashboard, agribusinessDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();

router.get('/farmer', protect, requireRole('farmer'), farmerDashboard);
router.get('/agribusiness', protect, requireRole('agribusiness'), agribusinessDashboard);

module.exports = router;
