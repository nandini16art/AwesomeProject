const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getCurrentUser
} = require("../controllers/userController");

router.get("/me", verifyToken, getCurrentUser);

module.exports = router;