import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  FileText,
  Clock,
  TrendingUp,
  ChevronRight,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";
import { formatINR, MONTH_NAMES } from "../../utils/formatCurrency";
import EmployeeIDCard from "../../components/employee/EmployeeIDCard";

export default function EmployeeDashboard() {
  const { user, authReady } = useAuthStore();
  const [lastPayslip, setLastPayslip] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const year = today.getFullYear();

  useEffect(() => {
    const empId = user?.employee?.id;
    if (!authReady) return;
    if (!empId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      api.get(`/payslips?year=${year}`),
      api.get(`/leaves/balance/${empId}?year=${year}`),
      api.get('/company')
    ])
      .then(([ps, lb, comp]) => {
        setLastPayslip(ps.data.data?.[0]);
        setLeaveBalance(lb.data.data);
        setCompany(comp.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authReady, user?.employee?.id]);

  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Welcome + Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero greeting */}
          <div className="relative rounded-2xl p-6 text-white overflow-hidden h-40 flex flex-col justify-center"
               style={{ background: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)' }}>
            {/* Amber glow */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(217,119,6,.25) 0%, transparent 70%)' }} />
            <div className="absolute -left-4 bottom-0 w-32 h-32 rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(245,158,11,.1) 0%, transparent 70%)' }} />
            <div className="relative">
              <p className="text-zinc-400 text-xs font-medium tracking-wide">{greeting()},</p>
              <h1 className="text-2xl font-semibold text-white mt-0.5 tracking-tight">{user?.name} 👋</h1>
              <p className="text-zinc-500 text-xs mt-1 font-normal">{format(today, 'EEEE, d MMMM yyyy')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Last payslip preview */}
            {lastPayslip ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Latest Payslip</h3>
                  <Link to="/employee/payslips" className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1">
                    VIEW ALL <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{MONTH_NAMES[lastPayslip.month - 1]} {lastPayslip.year}</p>
                    <p className="text-2xl font-black text-gray-900 mt-0.5">{formatINR(lastPayslip.netPay)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center text-center py-10 bg-gray-50/50 border-dashed">
                <FileText size={32} className="text-gray-200 mb-2" />
                <p className="text-xs text-gray-400 font-medium">No payslips yet</p>
              </div>
            )}

            {/* Leave balance preview */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Leave Balance</h3>
                <Link to="/employee/leaves" className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1">
                  APPLY <ChevronRight size={12} />
                </Link>
              </div>
              <div className="flex gap-2">
                {leaveBalance.slice(0, 3).map(b => (
                  <div key={b.leaveType} className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{b.leaveType}</p>
                    <p className="text-lg font-black text-primary">{b.balance}</p>
                  </div>
                ))}
                {leaveBalance.length === 0 && <p className="text-xs text-gray-400 py-2">Not initialised</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right col: ID Card */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <EmployeeIDCard user={user} employee={user?.employee} company={company} />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { to: "/employee/payslips", icon: "📄", label: "Download Payslip", color: "hover:border-green-300 hover:bg-green-50/40" },
            { to: "/employee/leaves", icon: "🏖", label: "Apply Leave", color: "hover:border-amber-300 hover:bg-amber-50/40" },
            { to: "/employee/profile", icon: "👤", label: "My Profile", color: "hover:border-purple-300 hover:bg-purple-50/40" },
          ].map((a) => (
            <Link key={a.to} to={a.to} className={`card card-hover text-center py-5 border transition-colors ${a.color}`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="text-xs font-semibold text-gray-700">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
