const User = require('../models/User');
const crypto = require('crypto');

/**
 * Aadhaar Verhoeff algorithm check (simplified)
 * Real Aadhaar numbers must pass Verhoeff checksum.
 * For demo, we just validate 12 numeric digits.
 */
const isValidAadhaarFormat = (num) => /^\d{12}$/.test(num.replace(/\s|-/g, ''));

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @route  POST /api/aadhaar/send-otp
// @access Private
const sendOtp = async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    const clean = (aadhaarNumber || '').replace(/\s|-/g, '');

    if (!isValidAadhaarFormat(clean)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number. Must be exactly 12 digits.',
      });
    }

    const lastFour = clean.slice(-4);
    const masked = `XXXX-XXXX-${lastFour}`;
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP and Aadhaar info to user (select:false fields need explicit select)
    await User.findByIdAndUpdate(req.user._id, {
      'aadhaar.maskedNumber': masked,
      'aadhaar.lastFour': lastFour,
      'aadhaar.otp': otp,
      'aadhaar.otpExpiry': otpExpiry,
      'aadhaar.verified': false,
    });

    // In production: send OTP to mobile linked with Aadhaar via UIDAI API
    // For demo: return OTP in response (REMOVE in production!)
    res.json({
      success: true,
      message: `OTP sent to mobile linked with Aadhaar ending in ${lastFour}.`,
      maskedNumber: masked,
      // DEMO ONLY — remove in production:
      demoOtp: otp,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/aadhaar/verify-otp
// @access Private
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6-digit OTP.' });
    }

    // Fetch user including hidden OTP fields
    const user = await User.findById(req.user._id).select('+aadhaar.otp +aadhaar.otpExpiry');

    if (!user.aadhaar?.otp) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    }

    if (new Date() > user.aadhaar.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (user.aadhaar.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    // Mark verified, clear OTP
    user.aadhaar.verified = true;
    user.aadhaar.verifiedAt = new Date();
    user.aadhaar.otp = undefined;
    user.aadhaar.otpExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: '✅ Aadhaar verified successfully!',
      aadhaar: {
        maskedNumber: user.aadhaar.maskedNumber,
        lastFour: user.aadhaar.lastFour,
        verified: true,
        verifiedAt: user.aadhaar.verifiedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/aadhaar/status
// @access Private
const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      aadhaar: {
        maskedNumber: user.aadhaar?.maskedNumber || '',
        lastFour: user.aadhaar?.lastFour || '',
        verified: user.aadhaar?.verified || false,
        verifiedAt: user.aadhaar?.verifiedAt || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendOtp, verifyOtp, getStatus };
