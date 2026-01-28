import "dotenv/config";
import mongoose from "mongoose";
import colors from "colors";
import Attendance from "./src/models/attendance/attendance.model.js";
import db from "./src/db/mognodb.js";

const inspectRecord = async () => {
    await db();

    const recordId = "6979ddba4825340778d7db2d";
    console.log(`Inspecting record ID: ${recordId}`);

    const record = await Attendance.findById(recordId);
    console.log("Record by ID:", record);

    if (record) {
        console.log("Record Date:", `"${record.date}"`); // Quotes to see hidden spaces
        console.log("Record Employee:", record.employeeId);
    }

    // Also list all for employee to be sure
    const employeeId = "69673012b0e98dbe43b35c61";
    console.log(`\nListing all for employee: ${employeeId}`);
    const all = await Attendance.find({ employeeId });
    console.log(all);

    process.exit(0);
};

inspectRecord();
