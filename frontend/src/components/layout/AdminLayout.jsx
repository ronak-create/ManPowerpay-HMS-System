import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Settings, FileText, DollarSign, BarChart2, ClipboardList, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/supervisors', icon: UserCog, label: 'Supervisors' },
  { to: '/admin/salary-templates', icon: DollarSign, label: 'Salary Templates' },
  { to: '/admin/payroll', icon: FileText, label: 'Payroll' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
  { to: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
  { to: '/admin/company', icon: Settings, label: 'Company Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-primary flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="text-white font-bold text-lg">ManpowerPay HMS</div>
          <div className="text-white/60 text-xs mt-0.5">Administrator</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-white/20 text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-white text-sm font-medium">{user?.name}</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 text-xs mt-2 hover:text-white">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
