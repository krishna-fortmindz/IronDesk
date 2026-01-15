import mongoose from "mongoose";

const leavePolicySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    maxDaysPerYear: {
        type: Number,
        required: true
    },
    carryForward: {
        type: Boolean,
        default: false
    },
    requiresApproval: {
        type: Boolean,
        default: true
    },
    applicableRoles: {
        type: [String],
        default: [] 
    }
}, {
    timestamps: true
});

export default mongoose.model("LeavePolicy", leavePolicySchema);
