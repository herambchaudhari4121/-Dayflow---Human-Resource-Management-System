const User = require("../models/User");

// @desc    Get all employees (for display)
// @route   GET /api/employees
// @access  Private
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ isActive: true })
      .select(
        "name email employeeId role designation department profilePicture joiningDate"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create new employee (Admin/HR only)
// @route   POST /api/employees
// @access  Private (Admin/HR)
const createEmployee = async (req, res) => {
  try {
    const { companyName, name, email, phone, role, designation, department } =
      req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Parse name to generate employee ID
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts[nameParts.length - 1] || "Name";
    const currentYear = new Date().getFullYear();

    // Generate Employee ID
    const employeeId = await User.generateEmployeeId(
      companyName || "Company",
      firstName,
      lastName,
      currentYear
    );

    // Generate a random password
    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8).toUpperCase();

    // Create employee
    const employee = await User.create({
      companyName,
      name,
      email,
      phone,
      password: generatedPassword,
      role: role || "employee",
      employeeId,
      designation,
      department,
      isPasswordGenerated: true,
      mustChangePassword: true,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully. Temporary password generated.",
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        employeeId: employee.employeeId,
        temporaryPassword: generatedPassword, // Send this via email in production
      },
    });
  } catch (error) {
    console.error("Create employee error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update basic fields
    const allowedUpdates = [
      "name",
      "phone",
      "address",
      "designation",
      "department",
      "dateOfBirth",
      "nationality",
      "gender",
      "maritalStatus",
      "personalEmail",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
      }
    });

    // Update bank details if provided
    if (req.body.bankDetails) {
      employee.bankDetails = {
        accountNumber:
          req.body.bankDetails.accountNumber ||
          employee.bankDetails?.accountNumber ||
          "",
        bankName:
          req.body.bankDetails.bankName || employee.bankDetails?.bankName || "",
        ifscCode:
          req.body.bankDetails.ifscCode || employee.bankDetails?.ifscCode || "",
        panNumber:
          req.body.bankDetails.panNumber ||
          employee.bankDetails?.panNumber ||
          "",
        uanNumber:
          req.body.bankDetails.uanNumber ||
          employee.bankDetails?.uanNumber ||
          "",
        empCode:
          req.body.bankDetails.empCode || employee.bankDetails?.empCode || "",
      };
    }

    // Update company info if provided
    if (req.body.companyInfo) {
      employee.companyInfo = {
        company:
          req.body.companyInfo.company || employee.companyInfo?.company || "",
        department:
          req.body.companyInfo.department ||
          employee.companyInfo?.department ||
          "",
        manager:
          req.body.companyInfo.manager || employee.companyInfo?.manager || "",
        location:
          req.body.companyInfo.location || employee.companyInfo?.location || "",
      };
    }

    // Update salary structure if provided (Admin only)
    if (req.body.salaryStructure) {
      employee.salaryStructure = {
        wageType:
          req.body.salaryStructure.wageType ||
          employee.salaryStructure?.wageType ||
          "fixed",
        monthlyWage:
          req.body.salaryStructure.monthlyWage ||
          employee.salaryStructure?.monthlyWage ||
          0,
        yearlyWage:
          req.body.salaryStructure.yearlyWage ||
          employee.salaryStructure?.yearlyWage ||
          0,
        components:
          req.body.salaryStructure.components ||
          employee.salaryStructure?.components ||
          [],
      };
    }

    await employee.save();

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete/deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin/HR)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Soft delete - deactivate instead of removing
    employee.isActive = false;
    await employee.save();

    res.json({
      success: true,
      message: "Employee deactivated successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
