const Attendance = require("../models/Attendance");
const User = require("../models/User");

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      employee: req.user._id,
      date: { $gte: today },
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({
        message: "Already checked in today",
        attendance,
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        employee: req.user._id,
        date: new Date(),
      });
    }

    attendance.checkInTime = new Date();
    attendance.status = "present";
    await attendance.save();

    res.json({
      success: true,
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error("Check in error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private
const checkOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: { $gte: today },
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({
        message: "Please check in first",
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        message: "Already checked out today",
        attendance,
      });
    }

    attendance.checkOutTime = new Date();
    attendance.calculateWorkingHours();
    await attendance.save();

    res.json({
      success: true,
      message: "Checked out successfully",
      attendance,
    });
  } catch (error) {
    console.error("Check out error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private
const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: { $gte: today },
    });

    res.json({
      success: true,
      attendance: attendance || null,
      status: attendance
        ? attendance.checkOutTime
          ? "checked-out"
          : "checked-in"
        : "checked-out",
    });
  } catch (error) {
    console.error("Get today attendance error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance/history
// @access  Private
const getAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;

    const query = { employee: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: attendanceRecords.length,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Get attendance history error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all employees attendance (Admin/HR)
// @route   GET /api/attendance/all
// @access  Private (Admin/HR)
const getAllAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      date: { $gte: today },
    }).populate("employee", "name email employeeId");

    res.json({
      success: true,
      count: attendanceRecords.length,
      attendance: attendanceRecords,
    });
  } catch (error) {
    console.error("Get all attendance error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getAllAttendance,
};
