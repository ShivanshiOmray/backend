const express = require("express");
const {
  getAttendance,
  markAttendance,
} = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getAttendance);
router.post("/", authMiddleware, markAttendance);

module.exports = router;
