import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, CheckCircle, UserCog, ClipboardList } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard/admin').then(r => setStats(r.data.data));
  }, []);

  if (!stats) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Employees" value={stats.activeEmployees} sub={`of ${stats.totalEmployees} total`} icon={<Users />} color="blue" />
        <StatCard label="Present Today" value={stats.presentToday} sub={`${stats.absentToday} absent`} icon={<CheckCircle />} color="green" />
        <StatCard label="Supervisors" value={stats.totalSupervisors} icon={<UserCog />} color="purple" />
        <StatCard label="Pending Leaves" value={stats.pendingLeaves} icon={<ClipboardList />} color="amber" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Net Pay Trend (Last 6 Months)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.trend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="run.totalNetPay" fill="#1F4E79" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-bold">{value ?? '—'}</div>
      <div className="text-sm font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  );
}
