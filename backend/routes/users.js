const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');

const {
  getCurrentUser,
  getUsers,
  createUser,
  deleteUser,
} = require('../controllers/userController');

router.get('/me', verifyToken, getCurrentUser);
router.get('/', verifyToken, getUsers);
router.post('/', verifyToken, createUser);
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;
