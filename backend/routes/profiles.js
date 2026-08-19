const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      'profile-' + Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const {
  getProfiles,
  createProfile,
  getMyProfile,
  updateProfile,
  deleteProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} = require('../controllers/profileController');

router.get('/', verifyToken, getProfiles);
router.get('/me', verifyToken, getMyProfile);
router.post('/', verifyToken, createProfile);
router.put('/me', verifyToken, updateProfile);
router.delete('/me', verifyToken, deleteProfile);

router.post(
  '/me/photo',
  verifyToken,
  upload.single('photo'),
  uploadProfilePhoto,
);

router.delete('/me/photo', verifyToken, deleteProfilePhoto);

module.exports = router;
