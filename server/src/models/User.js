const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Company/Organization Info (for admin/HR during signup)
    companyName: {
      type: String,
      trim: true,
    },
    companyLogo: {
      type: String,
    },

    // Personal Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Authentication
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Don't return password by default
    },

    // Employee ID (Auto-generated based on the format)
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Role-based access control
    role: {
      type: String,
      enum: ["employee", "hr", "admin"],
      default: "employee",
    },

    // Job Details
    designation: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },

    // Salary Information with detailed components
    salaryStructure: {
      wageType: {
        type: String,
        enum: ["fixed", "hourly"],
        default: "fixed",
      },
      monthlyWage: { type: Number, default: 0 },
      yearlyWage: { type: Number, default: 0 },

      // Salary Components with percentage or fixed amount
      components: [
        {
          name: { type: String, required: true },
          type: {
            type: String,
            enum: ["allowance", "deduction"],
            required: true,
          },
          calculationType: {
            type: String,
            enum: ["percentage", "fixed"],
            default: "percentage",
          },
          value: { type: Number, required: true }, // Percentage or fixed amount
          amount: { type: Number, default: 0 }, // Calculated amount
        },
      ],

      // Legacy fields for backward compatibility
      basicSalary: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 },
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Password management
    isPasswordGenerated: {
      type: Boolean,
      default: false, // True if password was auto-generated
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    // Additional fields
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    profilePicture: {
      type: String,
    },

    // Private Info
    nationality: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed", ""],
      default: "",
    },
    personalEmail: {
      type: String,
      trim: true,
    },

    // Bank Details
    bankDetails: {
      accountNumber: { type: String, trim: true },
      bankName: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      panNumber: { type: String, trim: true },
      uanNumber: { type: String, trim: true },
      empCode: { type: String, trim: true },
    },

    // Company Info
    companyInfo: {
      company: { type: String, trim: true },
      department: { type: String, trim: true },
      manager: { type: String, trim: true },
      location: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Employee ID
userSchema.statics.generateEmployeeId = async function (
  companyName,
  firstName,
  lastName,
  year
) {
  // Format: [OI][first two letters][year][serial]
  // Example: OIJO20220001
  const companyCode = companyName.substring(0, 2).toUpperCase();
  const nameCode = (
    firstName.substring(0, 2) + lastName.substring(0, 2)
  ).toUpperCase();
  const yearCode = year.toString();

  // Find the last employee with similar pattern
  const lastEmployee = await this.findOne({
    employeeId: new RegExp(`^${companyCode}${nameCode}${yearCode}`),
  }).sort({ employeeId: -1 });

  let serial = "0001";
  if (lastEmployee && lastEmployee.employeeId) {
    const lastSerial = parseInt(lastEmployee.employeeId.slice(-4));
    serial = String(lastSerial + 1).padStart(4, "0");
  }

  return `${companyCode}${nameCode}${yearCode}${serial}`;
};

module.exports = mongoose.model("User", userSchema);
