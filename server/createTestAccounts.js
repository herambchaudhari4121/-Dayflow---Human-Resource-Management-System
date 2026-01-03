const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const createTestAccounts = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/dayflow-hrms"
    );
    console.log("✅ Connected to MongoDB");

    const User = require("./src/models/User");

    // Check if admin exists
    const adminExists = await User.findOne({ email: "admin@dayflow.com" });

    if (!adminExists) {
      // Create Admin Account
      const adminPassword = await bcrypt.hash("admin123", 10);
      const admin = await User.create({
        name: "Admin User",
        email: "admin@dayflow.com",
        password: adminPassword,
        role: "admin",
        employeeId: "ADAD20260001",
        designation: "System Administrator",
        department: "IT",
        phone: "+91-9876543210",
        companyName: "DayFlow HRMS",
        salaryStructure: {
          basicSalary: 80000,
          allowances: 20000,
          deductions: 8000,
        },
      });
      console.log("\n✅ Admin account created!");
      console.log("📧 Email: admin@dayflow.com");
      console.log("🔑 Password: admin123");
      console.log("👤 Role: admin");
    } else {
      console.log("\n⚠️  Admin account already exists");
      console.log("📧 Email: admin@dayflow.com");
      console.log("🔑 Password: admin123 (if not changed)");
    }

    // Check if HR exists
    const hrExists = await User.findOne({ email: "hr@dayflow.com" });

    if (!hrExists) {
      // Create HR Account
      const hrPassword = await bcrypt.hash("hr123", 10);
      const hr = await User.create({
        name: "HR Manager",
        email: "hr@dayflow.com",
        password: hrPassword,
        role: "hr",
        employeeId: "HRHRMA20260001",
        designation: "HR Manager",
        department: "Human Resources",
        phone: "+91-9876543211",
        salaryStructure: {
          basicSalary: 60000,
          allowances: 15000,
          deductions: 6000,
        },
      });
      console.log("\n✅ HR account created!");
      console.log("📧 Email: hr@dayflow.com");
      console.log("🔑 Password: hr123");
      console.log("👤 Role: hr");
    } else {
      console.log("\n⚠️  HR account already exists");
      console.log("📧 Email: hr@dayflow.com");
      console.log("🔑 Password: hr123 (if not changed)");
    }

    // Check if test employee exists
    const employeeExists = await User.findOne({
      email: "employee@dayflow.com",
    });

    if (!employeeExists) {
      // Create Test Employee Account
      const empPassword = await bcrypt.hash("emp123", 10);
      const employee = await User.create({
        name: "John Doe",
        email: "employee@dayflow.com",
        password: empPassword,
        role: "employee",
        employeeId: "JOJODO20260002",
        designation: "Software Developer",
        department: "Engineering",
        phone: "+91-9876543212",
        address: "123 Main Street, Mumbai, India",
        dateOfBirth: new Date("1995-06-15"),
        salaryStructure: {
          basicSalary: 50000,
          allowances: 12000,
          deductions: 5000,
        },
      });
      console.log("\n✅ Test employee account created!");
      console.log("📧 Email: employee@dayflow.com");
      console.log("🔑 Password: emp123");
      console.log("👤 Role: employee");
    } else {
      console.log("\n⚠️  Test employee account already exists");
      console.log("📧 Email: employee@dayflow.com");
      console.log("🔑 Password: emp123 (if not changed)");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎯 TEST INSTRUCTIONS:");
    console.log("=".repeat(60));
    console.log("\n1️⃣  Test as ADMIN:");
    console.log("   • Login: admin@dayflow.com / admin123");
    console.log("   • You can click ANY employee card");
    console.log("   • You will see ALL 4 tabs including Salary Info");
    console.log("   • You can edit salary details");
    console.log('   • You will see the "Important" notes section');

    console.log("\n2️⃣  Test as EMPLOYEE:");
    console.log("   • Login: employee@dayflow.com / emp123");
    console.log("   • You can only click YOUR OWN card");
    console.log("   • You will see only 3 tabs (NO Salary Info)");
    console.log("   • You can edit your personal details");
    console.log("   • Clicking other cards will show alert");

    console.log("\n3️⃣  Test as YOUR ACCOUNT:");
    console.log("   • Login: utsavhirapra21@gmail.com");
    console.log("   • Role: employee");
    console.log("   • Same restrictions as test employee");

    console.log("\n4️⃣  LOGOUT between tests:");
    console.log("   • Click profile dropdown → Log Out");
    console.log("   • Login with different account");
    console.log("   • Compare the differences!");

    console.log("\n" + "=".repeat(60));
    console.log("\n✨ All test accounts ready! Go to http://localhost:5175");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createTestAccounts();
