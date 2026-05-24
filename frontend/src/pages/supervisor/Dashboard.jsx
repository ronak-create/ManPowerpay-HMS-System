import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../api/axios';
import { Users, CheckCircle, XCircle, ClipboardList } from 'lucide-react';

export default function SupervisorDashboard() {
  const [stats, setStats] = useState(null);
  const today = format(new Date(), 'dd MMM yyyy');

  useEffect(() => {
    api.get('/reports/dashboard/supervisor').then(r => setStats(r.data.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-2">Good morning 👋</h1>
      <p className="text-gray-500 text-sm mb-6">Today is {today}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="My Team" value={stats?.totalTeam} icon={<Users />} color="blue" />
        <StatCard label="Present Today" value={stats?.presentToday} icon={<CheckCircle />} color="green" />
        <StatCard label="Absent Today" value={stats?.absentToday} icon={<XCircle />} color="red" />
        <StatCard label="Pending Leaves" value={stats?.pendingLeaves} icon={<ClipboardList />} color="amber" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value ?? '—'}</div>
      <div className="text-xs font-medium mt-0.5">{label}</div>
    </div>
  );
}
