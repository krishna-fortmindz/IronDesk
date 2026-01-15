import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    date: {
        type: String, 
        required: true
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    checkInLocation: {
        lat: Number,
        lng: Number
    },
    checkOutLocation: {
        lat: Number,
        lng: Number
    },
    method: {
        type: String,
        enum: ["BIOMETRIC", "MOBILE", "WEB"],
        default: "BIOMETRIC"
    },
    status: {
        type: String, 
        required: true
    }
}, {
    timestamps: true
});

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
