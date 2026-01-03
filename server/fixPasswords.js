const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const fixPasswords = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/dayflow-hrms"
    );
    console.log("✅ Connected to MongoDB\n");

    const User = require("./src/models/User");

    // Check admin
    const admin = await User.findOne({ email: "admin@dayflow.com" }).select(
      "+password"
    );

    if (admin) {
      const isMatch = await bcrypt.compare("admin123", admin.password);
      console.log("🔴 Admin account:");
      console.log("   Email: admin@dayflow.com");
      console.log('   Password "admin123" works:', isMatch);

      if (!isMatch) {
        console.log("   ⚠️  Fixing password...");
        admin.password = "admin123"; // Will be hashed by pre-save hook
        await admin.save();
        console.log("   ✅ Password fixed!");
      }
    } else {
      console.log("❌ Admin not found");
    }

    // Check employee
    const emp = await User.findOne({ email: "employee@dayflow.com" }).select(
      "+password"
    );

    if (emp) {
      const isMatch = await bcrypt.compare("emp123", emp.password);
      console.log("\n🟢 Employee account:");
      console.log("   Email: employee@dayflow.com");
      console.log('   Password "emp123" works:', isMatch);

      if (!isMatch) {
        console.log("   ⚠️  Fixing password...");
        emp.password = "emp123";
        await emp.save();
        console.log("   ✅ Password fixed!");
      }
    } else {
      console.log("❌ Employee not found");
    }

    console.log("\n✅ All passwords verified!\n");
    console.log("Try logging in now:");
    console.log("  Admin: admin@dayflow.com / admin123");
    console.log("  Employee: employee@dayflow.com / emp123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

fixPasswords();
