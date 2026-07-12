import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Settings, FileText,
  DollarSign, BarChart2, ClipboardList, LogOut, ChevronRight,
  Menu, Briefcase, FilePlus, Book, CreditCard
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import MobileSidebar from './MobileSidebar';
import NotificationBell from './NotificationBell';
import { companyLogoUrl } from '../../utils/branding';

const BRAND_GRADIENT = 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%)';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    ]
  },
  {
    label: 'People',
    items: [
      { to: '/admin/employees', icon: Users, label: 'Employees' },
    ]
  },
  {
    label: 'Payroll',
    items: [
      { to: '/admin/salary-templates', icon: DollarSign, label: 'Salary Templates' },
      { to: '/admin/payroll', icon: FileText, label: 'Payroll Run' },
      { to: '/admin/leaves', icon: Briefcase, label: 'Leave Management' },
      { to: '/admin/resignations', icon: FilePlus, label: 'Resignations' },
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
    items: [
      { to: '/admin/company', icon: Settings, label: 'Company Settings' },
      { to: '/admin/billing', icon: CreditCard, label: 'Billing & Plan' },
      { to: '/admin/docs', icon: Book, label: 'User Manual' },
    ]
  },
];

function SidebarContent({ user, company, logout, navigate, location, onNavClick }) {
  const logo = company?.logoPath ? companyLogoUrl(company.id) : null;
  const brandName = company?.name || 'ManpowerPay';
  return (
    <>
      {/* Logo / brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          {logo ? (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white overflow-hidden shadow-inner">
              <img src={logo} alt={brandName} className="w-full h-full object-contain p-0.5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
                 style={{ background: BRAND_GRADIENT }}>
              <span className="text-white font-bold text-sm tracking-tight">
                {brandName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm leading-tight tracking-tight truncate">{brandName}</div>
            <div className="text-zinc-400 text-[10px] uppercase tracking-widest font-medium">
              {company?.name ? 'Powered by ManpowerPay' : 'HMS Platform'}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/5 mb-3" />

      {/* User pill */}
      <div className="mx-3 mb-4 rounded-xl p-2.5 flex items-center gap-2.5"
           style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
             style={{ background: BRAND_GRADIENT }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-zinc-200 text-xs font-medium truncate leading-tight">{user?.name}</div>
          <div className="text-zinc-400 text-[10px] font-medium leading-tight">Administrator</div>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5"
                 style={{ color: 'rgba(161,161,170,.4)' }}>
              {group.label}
            </div>
            {group.items.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={onNavClick}
                className={({ isActive }) =>
                  `nav-item mb-0.5 ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}>
                {({ isActive }) => (
                  <>
                    <Icon size={15} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                    <span className="flex-1 text-sm">{label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: '#FCD34D' }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full nav-item nav-item-inactive text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={15} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { user, company, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allItems = navGroups.flatMap(g => g.items);
  const current = allItems.find(i =>
    i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
  );

  const sidebarProps = { user, company, logout, navigate, location, onNavClick: () => setMobileOpen(false) };

  return (
    <div className="flex h-screen bg-neu overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 bg-sidebar-texture shadow-sidebar">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SidebarContent {...sidebarProps} />
      </MobileSidebar>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-neu/80 backdrop-blur-sm flex items-center px-4 sm:px-6 gap-3 flex-shrink-0 z-40"
                style={{ boxShadow: '0 6px 16px -8px rgba(176,148,112,.4)' }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden btn-icon text-zinc-400 hover:bg-zinc-100"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb / page title */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <span className="truncate max-w-[160px]">{company?.name || 'ManpowerPay'}</span>
              <ChevronRight size={12} />
            </div>
            <h2 className="font-semibold text-zinc-800 text-sm truncate">{current?.label || 'Dashboard'}</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                 style={{ background: BRAND_GRADIENT }}
                 title={user?.name}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
