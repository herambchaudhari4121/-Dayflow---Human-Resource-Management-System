const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Paid Time Off", "Sick Time Off", "Unpaid Leave", "Other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: {
      type: String,
      required: false,
      default: "No reason provided",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    daysCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
leaveSchema.index({ employee: 1, startDate: 1 });
leaveSchema.index({ status: 1 });

// Calculate number of days
leaveSchema.pre("save", function () {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
});

module.exports = mongoose.model("Leave", leaveSchema);
