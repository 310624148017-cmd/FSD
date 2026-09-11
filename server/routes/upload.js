const express = require('express');
const upload = require('../middleware/multer');
const { uploadProfilePicture, deleteProfilePicture } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/profile-picture',
  protect,
  (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadProfilePicture
);

router.delete('/profile-picture', protect, deleteProfilePicture);

module.exports = router;
