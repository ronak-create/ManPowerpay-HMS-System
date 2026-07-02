import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import compression from "compression";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { errorHandler } from "./middleware/errorHandler.js";
import { trimMiddleware } from "./middleware/trim.js";

// Route imports
import authRoutes from "./modules/auth/auth.routes.js";
import companyRoutes from "./modules/company/company.routes.js";
import employeeRoutes from "./modules/employees/employee.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import leaveRoutes from "./modules/leaves/leave.routes.js";
import payrollRoutes from "./modules/payroll/payroll.routes.js";
import payslipRoutes from "./modules/payslips/payslip.routes.js";
import statutoryRoutes from "./modules/statutory/statutory.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import form16Routes from "./modules/payslips/form16.routes.js";
import salaryTemplateRoutes from "./modules/payroll/salaryTemplate.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import resignationRoutes from "./modules/resignations/resignation.routes.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Production Middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(trimMiddleware);

// Company logos are served via GET /api/company/logo (streamed from storage).

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login attempts per IP
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});
app.use("/api/auth/login", loginLimiter);

const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/payslips", payslipRoutes);
app.use("/api/form16", form16Routes);
app.use("/api/statutory", statutoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/salary-templates", salaryTemplateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/resignations", resignationRoutes);

const __dirname = dirname(fileURLToPath(import.meta.url));

// AFTER
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "../../frontend/dist")));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(join(__dirname, "../../frontend/dist/index.html"));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ManpowerPay API running on port ${PORT}`));

export default app;
