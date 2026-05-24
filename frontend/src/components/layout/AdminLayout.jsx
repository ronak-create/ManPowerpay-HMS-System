import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, Settings, FileText,
  DollarSign, BarChart2, ClipboardList, LogOut, ChevronRight,
  Bell, Menu
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import MobileSidebar from './MobileSidebar';

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true }]
  },
  {
    label: 'People',
    items: [
      { to: '/admin/employees', icon: Users, label: 'Employees' },
      { to: '/admin/supervisors', icon: UserCog, label: 'Supervisors' },
    ]
  },
  {
    label: 'Payroll',
    items: [
      { to: '/admin/salary-templates', icon: DollarSign, label: 'Salary Templates' },
      { to: '/admin/payroll', icon: FileText, label: 'Payroll Run' },
    ]
  },
  {
    label: 'Reports',
    items: [
      { to: '/admin/reports', icon: BarChart2, label: 'Reports & MIS' },
      { to: '/admin/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
    ]
  },
  {
    label: 'System',
    items: [{ to: '/admin/company', icon: Settings, label: 'Company Settings' }]
  },
];

function SidebarContent({ user, logout, navigate, location, onNavClick }) {
  return (
    <>
      {/* Logo */}
      <div className="p-5 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-primary flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-black text-sm">MP</span>
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">ManpowerPay</div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest font-medium">HMS Platform</div>
          </div>
        </div>
      </div>

      {/* User pill */}
      <div className="mx-3 mb-4 bg-white/8 rounded-xl p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
          <div className="text-white/40 text-[10px] font-medium">Administrator</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5 pb-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </div>
            {group.items.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={onNavClick}
                className={({ isActive }) =>
                  `nav-item mb-0.5 ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}>
                <Icon size={16} strokeWidth={2} />
                <span className="flex-1">{label}</span>
                {location.pathname.startsWith(to) && !end && (
                  <ChevronRight size={13} className="opacity-50" />
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full nav-item nav-item-inactive text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allItems = navGroups.flatMap(g => g.items);
  const current = allItems.find(i =>
    i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
  );

  const sidebarProps = { user, logout, navigate, location, onNavClick: () => setMobileOpen(false) };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar flex-col flex-shrink-0 shadow-sidebar">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SidebarContent {...sidebarProps} />
      </MobileSidebar>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-6 gap-3 flex-shrink-0 shadow-sm">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden btn-icon text-gray-500 hover:bg-gray-100 flex-shrink-0"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{current?.label || 'Dashboard'}</h2>
            <p className="text-xs text-gray-400 hidden sm:block">ManpowerPay HMS — Admin</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-icon text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Bell size={18} />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
