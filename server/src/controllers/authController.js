const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register new user (Admin/HR creating employee or self-signup)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { companyName, name, email, phone, password, role } = req.body;

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

    // Create user
    const user = await User.create({
      companyName,
      name,
      email,
      phone,
      password,
      role: role || "employee",
      employeeId,
      companyLogo: req.file ? req.file.path : null,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Authenticate user (Login)
// @route   POST /api/auth/signin
// @access  Public
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "Account is deactivated. Contact HR." });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  signup,
  signin,
  getMe,
};
