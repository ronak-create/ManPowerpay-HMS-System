import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin
import AdminLayout from './components/layout/AdminLayout';
import EmployeeList from './pages/admin/EmployeeList';
import EmployeeForm from './pages/admin/EmployeeForm';
import SupervisorList from './pages/admin/SupervisorList';

// Supervisor
import SupervisorLayout from './components/layout/SupervisorLayout';
import AttendanceEntry from './pages/supervisor/AttendanceEntry';

// Employee
import EmployeeLayout from './components/layout/EmployeeLayout';
import MyAttendance from './pages/employee/MyAttendance';

const DummyPage = ({ name }) => <div className="p-8"><h1>{name}</h1><p>Coming Soon...</p></div>;

const AdminDashboard = () => <DummyPage name="Admin Dashboard" />;
const CompanySettings = () => <DummyPage name="Company Settings" />;
const SalaryTemplates = () => <DummyPage name="Salary Templates" />;
const PayrollRun = () => <DummyPage name="Payroll Run" />;
const AdminReports = () => <DummyPage name="Admin Reports" />;
const AuditLogs = () => <DummyPage name="Audit Logs" />;

const SupervisorDashboard = () => <DummyPage name="Supervisor Dashboard" />;
const TeamOverview = () => <DummyPage name="Team Overview" />;
const LeaveApprovals = () => <DummyPage name="Leave Approvals" />;

const EmployeeDashboard = () => <DummyPage name="Employee Dashboard" />;
const MyPayslips = () => <DummyPage name="My Payslips" />;
const LeaveApplication = () => <DummyPage name="Leave Application" />;
const MyProfile = () => <DummyPage name="My Profile" />;

const PrivateRoute = ({ children, role }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="company" element={<CompanySettings />} />
          <Route path="supervisors" element={<SupervisorList />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/new" element={<EmployeeForm />} />
          <Route path="employees/:id/edit" element={<EmployeeForm />} />
          <Route path="salary-templates" element={<SalaryTemplates />} />
          <Route path="payroll" element={<PayrollRun />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Supervisor Routes */}
        <Route path="/supervisor" element={<PrivateRoute role="supervisor"><SupervisorLayout /></PrivateRoute>}>
          <Route index element={<SupervisorDashboard />} />
          <Route path="attendance" element={<AttendanceEntry />} />
          <Route path="team" element={<TeamOverview />} />
          <Route path="leaves" element={<LeaveApprovals />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={<PrivateRoute role="employee"><EmployeeLayout /></PrivateRoute>}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="payslips" element={<MyPayslips />} />
          <Route path="leaves" element={<LeaveApplication />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<div className="p-8 text-center text-red-600 text-xl">Access Denied</div>} />
      </Routes>
    </BrowserRouter>
  );
}
