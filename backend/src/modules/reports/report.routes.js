import { Router } from 'express';
import { attendanceReport, payrollSummaryReport, payrollTrend, headcountReport, advanceLedger, auditReport, dashboardStats, supervisorDashboardStats } from './report.controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

const router = Router();
router.use(verifyJWT);

router.get('/dashboard/admin', requireRole('admin'), dashboardStats);
router.get('/dashboard/supervisor', requireRole('supervisor'), supervisorDashboardStats);
router.get('/attendance', requireRole('admin', 'supervisor'), attendanceReport);
router.get('/payroll-summary', requireRole('admin'), payrollSummaryReport);
router.get('/payroll-trend', requireRole('admin'), payrollTrend);
router.get('/headcount', requireRole('admin'), headcountReport);
router.get('/advance-ledger', requireRole('admin'), advanceLedger);
router.get('/audit-logs', requireRole('admin'), auditReport);

export default router;
