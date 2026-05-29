import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, User, LogOut, ChevronRight, Briefcase, Menu, Book
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import MobileSidebar from './MobileSidebar';
import NotificationBell from './NotificationBell';

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/employee', icon: LayoutDashboard, label: 'Dashboard', end: true }]
  },
  {
    label: 'My Work',
    items: [
      { to: '/employee/payslips', icon: FileText, label: 'My Payslips' },
    ]
  },
  {
    label: 'HR',
    items: [
      { to: '/employee/leaves', icon: Briefcase, label: 'Leave Application' },
      { to: '/employee/resignation', icon: FileText, label: 'Resignation' },
      { to: '/employee/profile', icon: User, label: 'My Profile' },
    ]
  },
  {
    label: 'Support',
    items: [
      { to: '/employee/docs', icon: Book, label: 'User Manual' },
    ]
  },
];

function SidebarContent({ user, logout, navigate, location, onNavClick }) {
  return (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
               style={{ background: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)' }}>
            <span className="text-white font-bold text-sm tracking-tight">MP</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight tracking-tight">ManpowerPay</div>
            <div className="text-zinc-400 text-[10px] uppercase tracking-widest font-medium">HMS Platform</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/5 mb-3" />

      {/* User pill */}
      <div className="mx-3 mb-4 rounded-xl p-2.5 flex items-center gap-2.5"
           style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-semibold text-xs flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-zinc-200 text-xs font-medium truncate leading-tight">{user?.name}</div>
          <div className="text-zinc-400 text-[10px] font-medium leading-tight">Employee</div>
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

export default function EmployeeLayout() {
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
    <div className="flex h-screen bg-[#FAFAF8] overflow-hidden">
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
        <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-zinc-100 flex items-center px-4 sm:px-6 gap-3 flex-shrink-0 z-40"
                style={{ boxShadow: '0 1px 0 0 #F4F4F5' }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden btn-icon text-zinc-400 hover:bg-zinc-100"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb / page title */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <span>ManpowerPay</span>
              <ChevronRight size={12} />
            </div>
            <h2 className="font-semibold text-zinc-800 text-sm truncate">{current?.label || 'Dashboard'}</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                 style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}
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
