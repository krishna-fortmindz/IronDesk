import mongoose from "mongoose";

const workLocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    radiusInMeters: {
        type: Number,
        default: 100
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model("WorkLocation", workLocationSchema);
