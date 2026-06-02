import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema(
    {
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["INVENTORY", "LEAVE", "ATTENDANCE", "OTHER"],
            required: true
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        reviewNote: {
            type: String,
            default: null
        },
        reviewedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("Approval", approvalSchema);