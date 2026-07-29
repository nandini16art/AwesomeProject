const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    addEducation,
    getEducation,
    updateEducation,
    deleteEducation
} = require("../controllers/educationController");

router.post("/", verifyToken, addEducation);
router.get("/", verifyToken, getEducation);
router.put("/:id", verifyToken, updateEducation);
router.delete("/:id", verifyToken, deleteEducation);

module.exports = router;