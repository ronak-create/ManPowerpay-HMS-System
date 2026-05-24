import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import companyRoutes from './modules/company/company.routes.js';
import employeeRoutes from './modules/employees/employee.routes.js';
import supervisorRoutes from './modules/supervisors/supervisor.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import leaveRoutes from './modules/leaves/leave.routes.js';
import payrollRoutes from './modules/payroll/payroll.routes.js';
import payslipRoutes from './modules/payslips/payslip.routes.js';
import statutoryRoutes from './modules/statutory/statutory.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import salaryTemplateRoutes from './modules/payroll/salaryTemplate.routes.js';

dotenv.config();

const app = express();

app.use(helmet());
// Replace the cors line:
app.use(cors({
  origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login attempts per IP
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});
app.use('/api/auth/login', loginLimiter);

const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use('/api/', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/statutory', statutoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/salary-templates', salaryTemplateRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ManpowerPay API running on port ${PORT}`));

export default app;
