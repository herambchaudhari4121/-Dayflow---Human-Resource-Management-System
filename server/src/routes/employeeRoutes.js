const express = require("express");
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all employees - accessible to all authenticated users
router.get("/", getAllEmployees);

// Get single employee by ID
router.get("/:id", getEmployeeById);

// Create new employee - Admin/HR only
router.post("/", authorizeRoles("admin", "hr"), createEmployee);

// Update employee - Admin/HR can update anyone, employees can update self
router.put("/:id", updateEmployee);

// Delete/deactivate employee - Admin/HR only
router.delete("/:id", authorizeRoles("admin", "hr"), deleteEmployee);

module.exports = router;
