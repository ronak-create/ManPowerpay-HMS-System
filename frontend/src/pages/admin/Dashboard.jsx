import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CheckCircle, ClipboardList, MapPin, 
  TrendingUp, Calendar, ArrowRight, Loader 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../api/axios';

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === undefined || target === null || isNaN(target)) return;
    const start = Date.now();
    const end = parseInt(target);
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

function DashboardStatCard({ label, value, sub, icon, gradient, shadow }) {
  const displayValue = useCountUp(value);
  
  return (
    <div className="relative rounded-2xl p-5 text-white overflow-hidden"
         style={{
           background: gradient,
           boxShadow: `0 4px 14px 0 ${shadow || 'rgba(217,119,6,.3)'}`,
         }}>
      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.07) 50%, transparent 100%)',
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s infinite',
           }} />
      <div className="w-9 h-9 rounded-xl bg-black/15 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-3xl font-semibold tracking-tight">
        {displayValue}
      </div>
      <div className="text-white/70 text-xs font-medium mt-0.5 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-white/50 text-xs mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/reports/dashboard/admin');
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-amber-600" size={32} />
      </div>
    );
  }

  const cards = [
    {
      label: 'Active Employees', value: stats?.activeEmployees ?? 0,
      sub: `of ${stats?.totalEmployees} total`,
      icon: <Users size={18} className="text-white" />,
      gradient: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
    },
    {
      label: 'Present Today', value: stats?.presentToday ?? 0,
      sub: `${stats?.absentToday} absent`,
      icon: <CheckCircle size={18} className="text-white" />,
      gradient: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
      shadow: 'rgba(16,185,129,.3)',
    },
    {
      label: 'Pending Leaves', value: stats?.pendingLeaves ?? 0,
      sub: 'awaiting review',
      icon: <ClipboardList size={18} className="text-white" />,
      gradient: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #8B5CF6 100%)',
      shadow: 'rgba(124,58,237,.3)',
    },
    {
      label: 'Active Sites', value: stats?.totalSites ?? 0,
      sub: 'deployed locations',
      icon: <MapPin size={18} className="text-white" />,
      gradient: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 50%, #0EA5E9 100%)',
      shadow: 'rgba(14,165,233,.3)',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here is what's happening today, {format(new Date(), 'dd MMMM')}.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">System Live</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(card => (
          <DashboardStatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Quick Management</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { to: '/admin/employees/new', emoji: '👤', label: 'Add Employee', sub: 'Onboard new hire',   accent: '#D97706' },
              { to: '/admin/payroll',       emoji: '💰', label: 'Run Payroll',  sub: 'Process salaries',  accent: '#059669' },
              { to: '/admin/reports',       emoji: '📊', label: 'View Reports', sub: 'MIS & analytics',   accent: '#7C3AED' },
              { to: '/admin/company',       emoji: '⚙️', label: 'Settings',     sub: 'Company config',    accent: '#0284C7' },
            ].map(a => (
              <Link key={a.to} to={a.to}
                className="group bg-white rounded-2xl border border-zinc-100 shadow-card p-5
                           hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200 inline-block">{a.emoji}</div>
                <p className="font-semibold text-zinc-800 text-sm">{a.label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{a.sub}</p>
                <div className="mt-3 h-0.5 rounded-full w-0 group-hover:w-full transition-all duration-300"
                     style={{ background: a.accent }} />
              </Link>
            ))}
          </div>

          {/* Payroll Trend (Placeholder/Simplified) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Payroll Volume</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last 6 months processing trend</p>
              </div>
              <TrendingUp className="text-amber-500" size={20} />
            </div>
            
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {stats?.trend?.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-amber-50 rounded-t-lg group-hover:bg-amber-100 transition-colors relative"
                       style={{ height: `${(t.run?.payslips?.length || 0) * 10}px`, maxHeight: '100%' }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {t.run?.payslips?.length || 0} slips
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][t.month]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Upcoming Events</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Calendar</span>
              <Calendar size={14} className="text-gray-400" />
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.pendingLeaves > 0 ? (
                <div className="p-4 flex items-start gap-3 bg-amber-50/30">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Review Leave Requests</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{stats.pendingLeaves} requests awaiting your approval.</p>
                    <Link to="/admin/leaves" className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1 hover:underline">
                      Go to module <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              ) : null}
              <div className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Payroll Cycle</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Next payroll run starts in 3 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
