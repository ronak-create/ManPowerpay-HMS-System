import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileText, Calendar, Clock, TrendingUp, ChevronRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { formatINR, MONTH_NAMES } from '../../utils/formatCurrency';
import { StatusBadge } from '../../components/ui/Badge';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState(null);
  const [lastPayslip, setLastPayslip] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  // BUG FIX: was [] — so useEffect never re-ran after AppInit resolved
  // user.employee.id arrives asynchronously via /auth/me in AppInit;
  // adding it as a dependency ensures we fetch once it's available.
  useEffect(() => {
    const empId = user?.employee?.id;
    if (!empId) return; // wait until AppInit populates user.employee

    setLoading(true);
    Promise.all([
      api.get(`/attendance/employee/${empId}?month=${month}&year=${year}`),
      api.get(`/payslips?year=${year}`),
      api.get(`/leaves/balance/${empId}?year=${year}`)
    ]).then(([att, ps, lb]) => {
      setAttendance(att.data.data);
      setLastPayslip(ps.data.data?.[0]);
      setLeaveBalance(lb.data.data);
    }).catch(() => {
      // silently fail — individual sections can show empty state
    }).finally(() => setLoading(false));
  }, [user?.employee?.id]); // re-runs when employee ID becomes available

  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = attendance?.summary || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero greeting */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute right-12 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-8" />
        <div className="relative">
          <p className="text-white/70 text-sm font-medium">{greeting()},</p>
          <h1 className="text-2xl font-black mt-0.5">{user?.name} 👋</h1>
          <p className="text-white/60 text-sm mt-1">{format(today, 'EEEE, d MMMM yyyy')}</p>
        </div>
      </div>

      {/* Attendance summary */}
      <div>
        <h2 className="section-title">This Month — {MONTH_NAMES[month - 1]} {year}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Present', value: s.present ?? 0, color: 'from-green-500 to-emerald-600', icon: '✅' },
            { label: 'Absent', value: s.absent ?? 0, color: 'from-red-500 to-rose-600', icon: '❌' },
            { label: 'Half Days', value: s.halfDay ?? 0, color: 'from-amber-500 to-orange-500', icon: '🌗' },
            { label: 'OT Hours', value: s.totalOT ?? 0, color: 'from-blue-500 to-indigo-600', icon: '⏱' },
          ].map(c => (
            <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-4 text-white shadow-card`}>
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="text-2xl font-black">{c.value}</div>
              <div className="text-white/80 text-xs font-medium">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last payslip */}
        {lastPayslip ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Latest Payslip</h3>
              <Link to="/employee/payslips" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="bg-gradient-primary rounded-xl p-4 text-white mb-4">
              <p className="text-white/70 text-xs">{MONTH_NAMES[lastPayslip.month - 1]} {lastPayslip.year}</p>
              <p className="text-3xl font-black mt-0.5">{formatINR(lastPayslip.netPay)}</p>
              <p className="text-white/60 text-xs mt-1">Take-home pay</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Gross</p>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{formatINR(lastPayslip.grossPayable)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Deductions</p>
                <p className="font-bold text-red-600 text-sm mt-0.5">{formatINR(lastPayslip.totalDeductions)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Days</p>
                <p className="font-bold text-gray-800 text-sm mt-0.5">{lastPayslip.presentDays}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-8 text-center">
            <FileText size={32} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No payslips yet</p>
          </div>
        )}

        {/* Leave balances */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Leave Balance {year}</h3>
            <Link to="/employee/leaves" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              Apply <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {leaveBalance.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Leave balance not initialized yet</p>
            ) : leaveBalance.map(b => {
              const pct = b.total > 0 ? (b.used / b.total) * 100 : 0;
              const colors = { CL: 'bg-blue-500', PL: 'bg-green-500', SL: 'bg-amber-500', LWP: 'bg-gray-400' };
              return (
                <div key={b.leaveType} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    <span className="text-xs font-black text-gray-600">{b.leaveType}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-700">
                        {b.leaveType === 'CL' ? 'Casual Leave' : b.leaveType === 'PL' ? 'Privilege Leave' : b.leaveType === 'SL' ? 'Sick Leave' : 'Leave Without Pay'}
                      </span>
                      <span className="text-xs text-gray-500">{b.balance} left</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[b.leaveType] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{b.used} used of {b.total} total</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/employee/attendance', icon: '📅', label: 'View Attendance', color: 'hover:border-blue-300 hover:bg-blue-50/40' },
            { to: '/employee/payslips', icon: '📄', label: 'Download Payslip', color: 'hover:border-green-300 hover:bg-green-50/40' },
            { to: '/employee/leaves', icon: '🏖', label: 'Apply Leave', color: 'hover:border-amber-300 hover:bg-amber-50/40' },
            { to: '/employee/profile', icon: '👤', label: 'My Profile', color: 'hover:border-purple-300 hover:bg-purple-50/40' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className={`card card-hover text-center py-5 border transition-colors ${a.color}`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="text-xs font-semibold text-gray-700">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}