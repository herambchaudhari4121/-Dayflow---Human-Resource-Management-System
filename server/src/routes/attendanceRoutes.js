const express = require("express");
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAllAttendance,
} = require("../controllers/attendanceController");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Employee routes
router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);

// Admin/HR routes
router.get("/all", authorizeRoles("admin", "hr"), getAllAttendance);

module.exports = router;
