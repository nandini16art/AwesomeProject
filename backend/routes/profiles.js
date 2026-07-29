const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

const {
  getProfiles,
  createProfile,
  getMyProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');

router.get('/',verifyToken, getProfiles);
router.get("/me", verifyToken, getMyProfile);
router.post('/', verifyToken, createProfile);
router.put('/me', verifyToken, updateProfile);
router.delete('/me', verifyToken, deleteProfile);

module.exports = router;
