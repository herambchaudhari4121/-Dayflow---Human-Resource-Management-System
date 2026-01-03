const express = require("express");
const {
  createLeaveRequest,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  deleteLeave,
} = require("../controllers/leaveController");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Employee routes
router.post("/", createLeaveRequest);
router.get("/my-leaves", getMyLeaves);
router.delete("/:id", deleteLeave);

// Admin/HR routes
router.get("/all", authorizeRoles("admin", "hr"), getAllLeaves);
router.put("/:id/approve", authorizeRoles("admin", "hr"), approveLeave);
router.put("/:id/reject", authorizeRoles("admin", "hr"), rejectLeave);

module.exports = router;
