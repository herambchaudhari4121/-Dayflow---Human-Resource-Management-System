const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["present", "absent", "leave", "half-day"],
      default: "absent",
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
attendanceSchema.index({ employee: 1, date: 1 });

// Calculate working hours when checking out
attendanceSchema.methods.calculateWorkingHours = function () {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    this.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }
  return this.workingHours;
};

module.exports = mongoose.model("Attendance", attendanceSchema);
