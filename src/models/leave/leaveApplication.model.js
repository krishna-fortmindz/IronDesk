import mongoose from "mongoose";

const leaveApplicationSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    leavePolicyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LeavePolicy",
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    daysCount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
    }
}, {
    timestamps: true
});

export default mongoose.model("LeaveApplication", leaveApplicationSchema);
