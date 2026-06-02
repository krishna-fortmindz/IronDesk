import "dotenv/config";
import express from "express";
import morgan from "morgan";
import db from "./src/db/mognodb.js";
import colors from "colors";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/user.routes.js";
import employeeRouter from "./src/routes/employee.route.js";
import inventoryRouter from "./src/routes/inventory.routes.js";
import leaveRouter from "./src/routes/leave.routes.js";
import salaryRouter from "./src/routes/salary.routes.js";
import attendanceRouter from "./src/routes/attendance.routes.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";

const app = express();

app.use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Middleware to ensure DB connection before handling any request
app.use(async (req, res, next) => {
    try {
        await db();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});


app.use("/api/v1/users", userRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/leaves", leaveRouter);
app.use("/api/v1/salaries", salaryRouter);
app.use("/api/v1/attendance", attendanceRouter);

import companyRouter from "./src/routes/company.routes.js";
import approvalRouter from "./src/routes/approval.routes.js";
import breakdownRouter from "./src/routes/breakdown.routes.js";
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/approvals", approvalRouter);
app.use("/api/v1/breakdowns", breakdownRouter);
app.use(errorHandler);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Hello World!")
})







app.listen(port, "0.0.0.0", () => {
    console.log(`server running on port === ${port}`.bgCyan);
});

export default app;








//  All done. Here's a complete summary of every new endpoint added:

//   ---
//   New Endpoints

//   Auth (/api/v1/users)

//   ┌────────┬─────────────────┬────────────┬───────────────────────────────┐
//   │ Method │    Endpoint     │    Role    │          Description          │
//   ├────────┼─────────────────┼────────────┼───────────────────────────────┤
//   │ POST   │ /logout         │ Any (auth) │ Logout — clears refresh token │
//   ├────────┼─────────────────┼────────────┼───────────────────────────────┤
//   │ POST   │ /assign-company │ ADMIN      │ Assign a user to a company    │
//   └────────┴─────────────────┴────────────┴───────────────────────────────┘

//   ▎ Also added verifyJWT to previously unprotected /pending and /:id routes.

//   ---
//   Company (/api/v1/company)

//   ┌────────┬──────────┬───────┬────────────────────────┐
//   │ Method │ Endpoint │ Role  │      Description       │
//   ├────────┼──────────┼───────┼────────────────────────┤
//   │ POST   │ /        │ ADMIN │ Create a new company   │
//   ├────────┼──────────┼───────┼────────────────────────┤
//   │ GET    │ /        │ ADMIN │ List all companies     │
//   ├────────┼──────────┼───────┼────────────────────────┤
//   │ PATCH  │ /:id     │ ADMIN │ Update company details │
//   └────────┴──────────┴───────┴────────────────────────┘

//   ---
//   Employee (/api/v1/employees)

//   ┌────────┬─────────────────┬───────────┬─────────────────────┐
//   │ Method │    Endpoint     │   Role    │     Description     │
//   ├────────┼─────────────────┼───────────┼─────────────────────┤
//   │ GET    │ /:id            │ ADMIN, HR │ Get employee by ID  │
//   ├────────┼─────────────────┼───────────┼─────────────────────┤
//   │ PATCH  │ /:id/deactivate │ ADMIN, HR │ Deactivate employee │
//   ├────────┼─────────────────┼───────────┼─────────────────────┤
//   │ PATCH  │ /:id/activate   │ ADMIN, HR │ Activate employee   │
//   └────────┴─────────────────┴───────────┴─────────────────────┘

//   ▎ Also added verifyJWT + roleGuard to all existing employee routes.

//   ---
//   Inventory (/api/v1/inventory)

//   ┌────────┬────────────┬───────────┬─────────────────────────────────┐
//   │ Method │  Endpoint  │   Role    │           Description           │
//   ├────────┼────────────┼───────────┼─────────────────────────────────┤
//   │ GET    │ /low-stock │ ADMIN, HR │ Items at or below min threshold │
//   ├────────┼────────────┼───────────┼─────────────────────────────────┤
//   │ DELETE │ /:id       │ ADMIN     │ Delete an inventory item        │
//   └────────┴────────────┴───────────┴─────────────────────────────────┘

//   ▎ Also added verifyJWT + roleGuard to all existing inventory routes.

//   ---
//   Salary (/api/v1/salaries)

//   ┌────────┬───────────────────────┬───────────┬──────────────────────────────────────────┐
//   │ Method │       Endpoint        │   Role    │               Description                │
//   ├────────┼───────────────────────┼───────────┼──────────────────────────────────────────┤
//   │ GET    │ /                     │ ADMIN, HR │ Get all employees' salary structures     │
//   ├────────┼───────────────────────┼───────────┼──────────────────────────────────────────┤
//   │ GET    │ /payslip/employee/:id │ ADMIN, HR │ Generate payslip for a specific employee │
//   └────────┴───────────────────────┴───────────┴──────────────────────────────────────────┘

//   ---
//   Approvals (/api/v1/approvals) (new module)
// const port = process.env.PORT || 3000;

// │ GET    │ /        │ ADMIN, HR  │ Get all breakdowns (filter by ?status= ?severity=)                │
// ├────────┼──────────┼────────────┼───────────────────────────────────────────────────────────────────┤
// │ GET    │ /my      │ Any (auth) │ Get my own breakdown reports                                      │
// ├────────┼──────────┼────────────┼───────────────────────────────────────────────────────────────────┤
// │ GET    │ /:id     │ Any (auth) │ Get breakdown by ID                                               │
// ├────────┼──────────┼────────────┼───────────────────────────────────────────────────────────────────┤
// │ PATCH  │ /:id     │ ADMIN, HR  │ Update status / assign to engineer                                │
// └────────┴──────────┴────────────┴───────────────────────────────────────────────────────────────────┘




// ✻ Tinkering… (4m 10s · ↓ 18.0k tokens)

//   ┌────────┬──────────────┬────────────┬───────────────────────────────────────────────┐
//   │ Method │   Endpoint   │    Role    │                  Description                  │
//   ├────────┼──────────────┼────────────┼───────────────────────────────────────────────┤
//   │ POST   │ /            │ Any (auth) │ Submit an approval request                    │
//   ├────────┼──────────────┼────────────┼───────────────────────────────────────────────┤
//   │ GET    │ /            │ ADMIN, HR  │ Get all approvals (filter by ?status= ?type=) │
//   ├────────┼──────────────┼────────────┼───────────────────────────────────────────────┤
//   │ GET    │ /pending     │ ADMIN, HR  │ Get all pending approvals                     │
//   ├────────┼──────────────┼────────────┼───────────────────────────────────────────────┤