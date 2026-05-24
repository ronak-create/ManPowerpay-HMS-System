import { useState, useEffect } from 'react';
import { Download, Users, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { MONTH_NAMES } from '../../utils/formatCurrency';

export default function TeamOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchReport(); }, [month, year]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/reports/attendance?month=${month}&year=${year}`);
      setData(r.data.data);
    } catch { toast.error('Failed to load team data'); }
    finally { setLoading(false); }
  };

  const downloadExcel = async () => {
    try {
      const r = await api.get(`/reports/attendance?month=${month}&year=${year}&format=excel`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `attendance_${month}_${year}.xlsx`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const statusDot = { P: 'bg-green-500', A: 'bg-red-500', H: 'bg-amber-500', PL: 'bg-blue-500', WO: 'bg-gray-300', HO: 'bg-purple-400', LWP: 'bg-red-700', '': 'bg-gray-100' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Team Overview</h1>
          <p className="page-subtitle">Monthly attendance summary for your team</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-base w-32">
            {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-base w-24">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={downloadExcel} className="btn-secondary">
            <Download size={15} /> Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data?.data?.length ? (
        <div className="card text-center py-12">
          <Users size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No team data found</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const totals = data.data.reduce((acc, { summary: s }) => ({
                p: acc.p + s.p, a: acc.a + s.a, h: acc.h + s.h, pl: acc.pl + s.pl
              }), { p: 0, a: 0, h: 0, pl: 0 });
              return [
                { label: 'Total Present', value: totals.p, color: 'from-green-500 to-emerald-600', icon: '✅' },
                { label: 'Total Absent', value: totals.a, color: 'from-red-500 to-rose-600', icon: '❌' },
                { label: 'Half Days', value: totals.h, color: 'from-amber-500 to-orange-500', icon: '🌗' },
                { label: 'Paid Leaves', value: totals.pl, color: 'from-blue-500 to-indigo-600', icon: '🏖' },
              ].map(c => (
                <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-4 text-white shadow-card`}>
                  <div className="text-xl mb-1">{c.icon}</div>
                  <div className="text-2xl font-black">{c.value}</div>
                  <div className="text-white/80 text-xs font-medium">{c.label}</div>
                </div>
              ));
            })()}
          </div>

          {/* Per-employee table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{data.data.length} Team Members</h3>
              <span className="text-xs text-gray-400">{MONTH_NAMES[month - 1]} {year}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase sticky left-0 bg-gray-50">Employee</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-green-600 uppercase">P</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-red-500 uppercase">A</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-amber-500 uppercase">H</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-blue-500 uppercase">PL</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Working Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.data.map(({ emp, summary: s }) => (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 sticky left-0 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {emp.user?.name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{emp.user?.name}</p>
                            <p className="text-xs text-gray-400">{emp.empCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-green-600">{s.p}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-red-500">{s.a}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-amber-500">{s.h}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-blue-500">{s.pl}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-primary-50 text-primary text-sm font-black">
                          {s.workingDays}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
