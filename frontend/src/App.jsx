import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import api from './api/axios';
import useAuthStore from './store/authStore';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AttendanceEntry from './pages/admin/AttendanceEntry';
import AdminLayout from './components/layout/AdminLayout';
import EmployeeList from './pages/admin/EmployeeList';
import EmployeeForm from './pages/admin/EmployeeForm';
import SalaryTemplates from './pages/admin/SalaryTemplates';
import PayrollRun from './pages/admin/PayrollRun';
import LeaveManagement from './pages/admin/LeaveManagement';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import CompanySettings from './pages/admin/CompanySettings';

// Employee
import EmployeeLayout from './components/layout/EmployeeLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import MyPayslips from './pages/employee/MyPayslips';
import LeaveApplication from './pages/employee/LeaveApplication';
import MyProfile from './pages/employee/MyProfile';

const PrivateRoute = ({ children, role }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
};

// App.jsx — AppInit
function AppInit() {
  const { token, login, logout, setAuthReady } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setAuthReady();       // no token → auth check done, nothing to fetch
      return;
    }
    api.get('/auth/me')
      .then(r => login(r.data.data, token))
      .catch(() => logout())
      .finally(() => setAuthReady());  // ← always mark done
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="attendance" element={<AttendanceEntry />} />
          <Route path="company" element={<CompanySettings />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/new" element={<EmployeeForm />} />
          <Route path="employees/:id/edit" element={<EmployeeForm />} />
          <Route path="salary-templates" element={<SalaryTemplates />} />
          <Route path="payroll" element={<PayrollRun />} />
          <Route path="leaves" element={<LeaveManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        <Route path="/employee" element={<PrivateRoute role="employee"><EmployeeLayout /></PrivateRoute>}>
          <Route index element={<EmployeeDashboard />} />
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
