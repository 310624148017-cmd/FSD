const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// @route  POST /api/upload/profile-picture
// @access Private
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Delete old picture if exists
    const user = await User.findById(req.user._id);
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '..', 'uploads', user.profilePicture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Save new filename to user
    user.profilePicture = req.file.filename;
    await user.save();

    const pictureUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Profile picture updated.',
      profilePicture: pictureUrl,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        profilePicture: pictureUrl,
        aadhaar: user.aadhaar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/upload/profile-picture
// @access Private
const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.profilePicture) {
      const filePath = path.join(__dirname, '..', 'uploads', user.profilePicture);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      user.profilePicture = '';
      await user.save();
    }
    res.json({ success: true, message: 'Profile picture removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadProfilePicture, deleteProfilePicture };
