import mongoose from "mongoose";

const breakdownSchema = new mongoose.Schema(
    {
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        equipmentName: {
            type: String,
            required: true,
            trim: true
        },
        rawDescription: {
            type: String,
            required: true
        },
        generatedSummary: {
            type: String,
            default: null
        },
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            default: "MEDIUM"
        },
        status: {
            type: String,
            enum: ["REPORTED", "IN_PROGRESS", "RESOLVED", "CLOSED"],
            default: "REPORTED"
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        resolvedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("Breakdown", breakdownSchema);