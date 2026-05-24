import { useState, useEffect } from 'react';
import { Download, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatINR, MONTH_NAMES } from '../../utils/formatCurrency';
import { StatusBadge } from '../../components/ui/Badge';

export default function MyPayslips() {
  const [payslips, setPayslips] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  useEffect(() => { fetchPayslips(); }, [year]);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/payslips?year=${year}`);
      setPayslips(r.data.data);
    } catch { toast.error('Failed to load payslips'); }
    finally { setLoading(false); }
  };

  const downloadPDF = async (id, month, empCode) => {
    setDownloading(id);
    try {
      const res = await api.get(`/payslips/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `payslip_${month}_${year}_${empCode}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">My Payslips</h1>
          <p className="page-subtitle">Download and view your salary statements</p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="input-base w-32">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payslips.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <FileText size={48} className="text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-500">No payslips for {year}</h3>
          <p className="text-sm text-gray-400 mt-1">Payslips appear here after payroll is processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payslips.map(p => (
            <div key={p.id} className="card overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {MONTH_NAMES[p.month - 1].slice(0, 3).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{MONTH_NAMES[p.month - 1]} {p.year}</h3>
                  <p className="text-xs text-gray-500">{p.presentDays} days worked · {p.otHours}h OT</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">Net Pay</p>
                  <p className="text-xl font-black text-green-600">{formatINR(p.netPay)}</p>
                </div>
                <StatusBadge status={p.payrollRun?.status || 'locked'} />
                <button
                  onClick={() => downloadPDF(p.id, p.month, p.employee?.empCode || '')}
                  disabled={downloading === p.id}
                  className="btn-primary flex-shrink-0"
                >
                  {downloading === p.id
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Download size={15} />}
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  className="btn-icon text-gray-400 hover:bg-gray-100"
                >
                  {expanded === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Mobile net pay */}
              <div className="sm:hidden mt-3 pt-3 border-t border-gray-50 flex justify-between">
                <span className="text-sm text-gray-500">Net Pay</span>
                <span className="font-black text-green-600">{formatINR(p.netPay)}</span>
              </div>

              {/* Expanded breakdown */}
              {expanded === p.id && (
                <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">Earnings</h4>
                    <div className="space-y-2">
                      {(p.earningsJson || []).map(e => (
                        <div key={e.name} className="flex justify-between text-sm">
                          <span className="text-gray-600">{e.name}</span>
                          <span className="font-semibold text-gray-800">{formatINR(e.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                        <span>Total Earnings</span>
                        <span className="text-green-600">{formatINR(p.grossPayable)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">Deductions</h4>
                    <div className="space-y-2">
                      {(p.deductionsJson || []).map(d => (
                        <div key={d.name} className="flex justify-between text-sm">
                          <span className="text-gray-600">{d.name}</span>
                          <span className="font-semibold text-red-600">{formatINR(d.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                        <span>Total Deductions</span>
                        <span className="text-red-600">{formatINR(p.totalDeductions)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2 bg-gradient-primary rounded-xl p-4 text-white flex justify-between items-center">
                    <span className="font-semibold">Take-Home Pay</span>
                    <span className="text-2xl font-black">{formatINR(p.netPay)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
