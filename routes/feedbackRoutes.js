const express = require("express");
const multer = require("multer");
const {
  addFeedback,
  getFeedback,
} = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", authMiddleware, upload.single("image"), addFeedback);
router.get("/", authMiddleware, getFeedback);

module.exports = router;
