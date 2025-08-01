const express = require("express");
const multer = require("multer");
const { updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.put("/", authMiddleware, upload.single("photo"), updateProfile);

module.exports = router;
