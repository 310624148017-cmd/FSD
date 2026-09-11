const express = require('express');
const { sendOtp, verifyOtp, getStatus } = require('../controllers/aadhaarController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/status', protect, getStatus);
router.post('/send-otp', protect, sendOtp);
router.post('/verify-otp', protect, verifyOtp);

module.exports = router;
