import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
        unique: true
    },
    baseSalary: {
        type: Number,
        required: true
    },
    allowances: {
        type: Map,
        of: Number,
        default: {}
    },
    deductions: {
        type: Map,
        of: Number,
        default: {}
    },
    effectiveFrom: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model("Salary", salarySchema);
