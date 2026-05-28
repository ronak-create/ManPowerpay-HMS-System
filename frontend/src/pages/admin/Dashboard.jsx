import { useState, useEffect } from 'react';
import { Users, CheckCircle, MapPin, ClipboardList, TrendingUp, ArrowUpRight, FileText, Plus, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import api from '../../api/axios';
import { formatINR, MONTH_NAMES } from '../../utils/formatCurrency';
import { StatusBadge } from '../../components/ui/Badge';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-black text-primary">{formatINR(payload[0]?.value || 0)}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard/admin'),
      api.get('/reports/payroll-trend')
    ]).then(([s, t]) => {
      setStats(s.data.data);
      setTrend(t.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const trendData = trend.map(t => ({
    label: t.label,
    netPay: t.netPay
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="col-span-1 bg-gradient-to-br from-primary-800 to-primary-light rounded-2xl p-5 text-white shadow-card">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <Users size={20} className="text-white" />
          </div>
          <div className="text-3xl font-black">{stats?.activeEmployees ?? '—'}</div>
          <div className="text-white/80 text-sm font-medium mt-0.5">Active Employees</div>
          <div className="text-white/50 text-xs mt-1">of {stats?.totalEmployees} total</div>
        </div>
        <div className="col-span-1 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-5 text-white shadow-card">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <CheckCircle size={20} className="text-white" />
          </div>
          <div className="text-3xl font-black">{stats?.presentToday ?? '—'}</div>
          <div className="text-white/80 text-sm font-medium mt-0.5">Present Today</div>
          <div className="text-white/50 text-xs mt-1">{stats?.absentToday} absent</div>
        </div>
        <div className="col-span-1 bg-gradient-to-br from-violet-600 to-purple-500 rounded-2xl p-5 text-white shadow-card">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div className="text-3xl font-black">{stats?.pendingLeaves ?? '—'}</div>
          <div className="text-white/80 text-sm font-medium mt-0.5">Pending Leaves</div>
        </div>
        <div className="col-span-1 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-card">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <MapPin size={20} className="text-white" />
          </div>
          <div className="text-3xl font-black">{stats?.totalSites ?? '—'}</div>
          <div className="text-white/80 text-sm font-medium mt-0.5">Active Sites</div>
        </div>
      </div>

      {/* Payroll status + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Net Pay Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months disbursement</p>
            </div>
            <BarChart2 size={18} className="text-gray-300" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => v > 0 ? `${(v/1000).toFixed(0)}k` : '0'} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 4 }} />
                <Bar dataKey="netPay" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E75B6" />
                    <stop offset="100%" stopColor="#1F4E79" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payroll status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Latest Payroll</h3>
          {stats?.currentRun ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <FileText size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {MONTH_NAMES[(stats.currentRun.month || 1) - 1]} {stats.currentRun.year}
                  </p>
                  <StatusBadge status={stats.currentRun.status} />
                </div>
              </div>
              <Link to="/admin/payroll" className="w-full btn-primary justify-center">
                Manage Payroll <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">No payroll run yet</p>
              <Link to="/admin/payroll" className="btn-primary text-sm">
                <Plus size={15} /> Process Payroll
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/admin/employees/new', icon: '➕', label: 'Add Employee', sub: 'Onboard a new hire', color: 'hover:border-blue-200 hover:bg-blue-50/30' },
            { to: '/admin/payroll', icon: '💰', label: 'Run Payroll', sub: 'Process monthly salary', color: 'hover:border-green-200 hover:bg-green-50/30' },
            { to: '/admin/reports', icon: '📊', label: 'View Reports', sub: 'MIS & analytics', color: 'hover:border-purple-200 hover:bg-purple-50/30' },
            { to: '/admin/company', icon: '⚙️', label: 'Settings', sub: 'Company configuration', color: 'hover:border-amber-200 hover:bg-amber-50/30' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className={`bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-200 shadow-card ${a.color} group`}>
              <div className="text-3xl mb-3">{a.icon}</div>
              <p className="font-semibold text-gray-800 text-sm group-hover:text-primary transition-colors">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
