const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');

const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('../controllers/followController');

router.post('/:userId', verifyToken, followUser);

router.delete('/:userId', verifyToken, unfollowUser);

router.get('/followers', verifyToken, getFollowers);

router.get('/following', verifyToken, getFollowing);

module.exports = router;
