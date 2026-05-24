import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Calendar, User, LogOut, ChevronRight, Bell, Briefcase
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/employee', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ]
  },
  {
    label: 'My Work',
    items: [
      { to: '/employee/attendance', icon: Calendar, label: 'My Attendance' },
      { to: '/employee/payslips', icon: FileText, label: 'My Payslips' },
    ]
  },
  {
    label: 'HR',
    items: [
      { to: '/employee/leaves', icon: Briefcase, label: 'Leave Application' },
      { to: '/employee/profile', icon: User, label: 'My Profile' },
    ]
  },
];

export default function EmployeeLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const allItems = navGroups.flatMap(g => g.items);
  const current = allItems.find(i => i.end ? location.pathname === i.to : location.pathname.startsWith(i.to));

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <aside className="w-64 bg-sidebar flex flex-col flex-shrink-0 shadow-sidebar">
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-primary flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">MP</span>
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">ManpowerPay</div>
              <div className="text-white/40 text-[10px] uppercase tracking-widest font-medium">HMS Platform</div>
            </div>
          </div>
        </div>

        <div className="mx-3 mb-4 bg-white/8 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
            <div className="text-white/40 text-[10px] font-medium">Employee</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5">{group.label}</div>
              {group.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) =>
                    `nav-item mb-0.5 ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}>
                  <Icon size={16} strokeWidth={2} />
                  <span className="flex-1">{label}</span>
                  {location.pathname.startsWith(to) && !end && <ChevronRight size={13} className="opacity-50" />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full nav-item nav-item-inactive text-red-400/80 hover:text-red-400 hover:bg-red-500/10">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0 shadow-sm">
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{current?.label || 'Dashboard'}</h2>
            <p className="text-xs text-gray-400">ManpowerPay HMS — Employee</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-icon text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
