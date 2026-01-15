import "dotenv/config";
import express from "express";
import morgan from "morgan";
import db from "./src/db/mognodb.js";
import colors from "colors";

import cookieParser from "cookie-parser";
import userRouter from "./src/routes/user.routes.js";
import employeeRouter from "./src/routes/employee.route.js";
import inventoryRouter from "./src/routes/inventory.routes.js";
import leaveRouter from "./src/routes/leave.routes.js";
import salaryRouter from "./src/routes/salary.routes.js";
import attendanceRouter from "./src/routes/attendance.routes.js";
const app = express();
console.log("=== Environment Variables ===");
console.log("ACCESS_TOKEN_SECRET exists:", !!process.env.ACCESS_TOKEN_SECRET);
console.log("ACCESS_TOKEN_SECRET length:", process.env.ACCESS_TOKEN_SECRET?.length);
console.log("PORT:", process.env.PORT);
console.log("ENV CHECK");
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("ENV FILE PATH:", process.cwd());

console.log("=============================");

app.use(express.json());
app.use(cookieParser());


app.use(morgan("dev"));
db();


app.use("/api/v1/users", userRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/leaves", leaveRouter);
app.use("/api/v1/salaries", salaryRouter);
app.use("/api/v1/attendance", attendanceRouter);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Hello World!")
})

import { errorHandler } from "./src/middlewares/error.middleware.js";
app.use(errorHandler);






app.listen(port, () => {
    console.log(`server running on port === ${port}`.bgCyan);
});