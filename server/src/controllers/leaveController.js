const Leave = require("../models/Leave");
const User = require("../models/User");

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
const createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;

    if (!startDate || !endDate || !leaveType) {
      return res.status(400).json({
        message: "Please provide start date, end date, and leave type",
      });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      startDate,
      endDate,
      leaveType,
      reason: reason || "No reason provided",
    });

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leave,
    });
  } catch (error) {
    console.error("Create leave error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's leave requests
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .populate("approvedBy", "name");

    // Calculate available days
    const paidTimeOffUsed = leaves
      .filter((l) => l.status === "approved" && l.leaveType === "Paid Time Off")
      .reduce((sum, l) => sum + l.daysCount, 0);

    const sickTimeOffUsed = leaves
      .filter((l) => l.status === "approved" && l.leaveType === "Sick Time Off")
      .reduce((sum, l) => sum + l.daysCount, 0);

    const paidTimeOffAvailable = Math.max(0, 24 - paidTimeOffUsed);
    const sickTimeOffAvailable = Math.max(0, 7 - sickTimeOffUsed);

    res.json({
      success: true,
      leaves,
      statistics: {
        paidTimeOffAvailable,
        paidTimeOffUsed,
        sickTimeOffAvailable,
        sickTimeOffUsed,
      },
    });
  } catch (error) {
    console.error("Get my leaves error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all leave requests (Admin/HR)
// @route   GET /api/leaves/all
// @access  Private (Admin/HR)
const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate("employee", "name email employeeId")
      .populate("approvedBy", "name");

    res.json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error("Get all leaves error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve leave request
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin/HR)
const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message: `Leave request is already ${leave.status}`,
      });
    }

    leave.status = "approved";
    leave.approvedBy = req.user._id;
    leave.approvalDate = new Date();

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate("employee", "name email")
      .populate("approvedBy", "name");

    res.json({
      success: true,
      message: "Leave request approved successfully",
      leave: populatedLeave,
    });
  } catch (error) {
    console.error("Approve leave error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reject leave request
// @route   PUT /api/leaves/:id/reject
// @access  Private (Admin/HR)
const rejectLeave = async (req, res) => {
  try {
    const { reason } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message: `Leave request is already ${leave.status}`,
      });
    }

    leave.status = "rejected";
    leave.approvedBy = req.user._id;
    leave.approvalDate = new Date();
    leave.rejectionReason = reason || "No reason provided";

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate("employee", "name email")
      .populate("approvedBy", "name");

    res.json({
      success: true,
      message: "Leave request rejected",
      leave: populatedLeave,
    });
  } catch (error) {
    console.error("Reject leave error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private
const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Only allow deletion by the employee who created it or admin
    if (
      leave.employee.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "hr"
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this leave request",
      });
    }

    // Only allow deletion of pending requests
    if (leave.status !== "pending") {
      return res.status(400).json({
        message: "Cannot delete approved or rejected leave requests",
      });
    }

    await leave.deleteOne();

    res.json({
      success: true,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Delete leave error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createLeaveRequest,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  deleteLeave,
};
