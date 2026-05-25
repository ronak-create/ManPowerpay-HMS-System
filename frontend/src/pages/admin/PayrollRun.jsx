import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Play, Check, Lock, Download, FileText, ChevronRight, Eye, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatINR } from '../../utils/formatCurrency';

export default function PayrollRun() {
  const [step, setStep] = useState(1); // 1: List, 2: Review
  const [runs, setRuns] = useState([]);
  const [currentRun, setCurrentRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchRuns(); }, []);

  const fetchRuns = async () => {
    const res = await api.get('/payroll');
    setRuns(res.data.data);
  };

  const startPayroll = async () => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    setLoading(true);
    try {
      const res = await api.post('/payroll/run', { month, year });
      // Fetch details with payslips
      const detailRes = await api.get(`/payroll/${res.data.data.run.id}`);
      setCurrentRun(detailRes.data.data);
      setStep(2);
      fetchRuns();
    } catch (err) {
      toast.error('Failed to start payroll');
    } finally {
      setLoading(false);
    }
  };

  const viewRun = async (run) => {
    setLoading(true);
    try {
      const res = await api.get(`/payroll/${run.id}`);
      setCurrentRun(res.data.data);
      setStep(2);
    } catch (err) {
      toast.error('Failed to load payroll details');
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/payroll/${currentRun.id}/approve`);
      toast.success('Payroll approved');
      const res = await api.get(`/payroll/${currentRun.id}`);
      setCurrentRun(res.data.data);
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const lock = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/payroll/${currentRun.id}/lock`);
      toast.success('Payroll locked. Attendance records and advance balances updated.');
      const res = await api.get(`/payroll/${currentRun.id}`);
      setCurrentRun(res.data.data);
    } catch (err) {
      toast.error('Lock failed');
    } finally {
      setActionLoading(false);
    }
  };

  const downloadBankFile = async () => {
    try {
      const res = await api.get(`/payroll/${currentRun.id}/bank-file`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bank_file_${currentRun.month}_${currentRun.year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download bank file');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Payroll Management</h1>
          <p className="page-subtitle">Process monthly salaries, approve disbursements and lock records</p>
        </div>
        {step === 2 && (
          <button onClick={() => setStep(1)} className="btn-secondary">
            Back to List
          </button>
        )}
      </div>
      
      {step === 1 && (
        <div className="space-y-6">
          <div className="card bg-gradient-primary text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold">Current Payroll Period</h2>
              <p className="text-white/70 text-sm">{format(new Date(), 'MMMM yyyy')}</p>
            </div>
            <button 
              onClick={startPayroll} 
              disabled={loading} 
              className="bg-white text-primary px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-50 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Run Payroll Now'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Past Payroll Runs</h2>
              <FileText size={18} className="text-gray-300" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Month/Year</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Employees</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {runs.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition group">
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][r.month]} {r.year}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          r.status === 'locked' ? 'bg-green-100 text-green-700' :
                          r.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{r._count?.payslips ?? 0}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => viewRun(r)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {runs.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-12 text-gray-400 text-sm">No payroll history found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {step === 2 && currentRun && (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
              <p className="text-lg font-black text-gray-800 capitalize mt-1">{currentRun.status}</p>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Employees</p>
              <p className="text-lg font-black text-gray-800 mt-1">{currentRun.payslips?.length || 0}</p>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Disbursement</p>
              <p className="text-lg font-black text-green-600 mt-1">
                {formatINR(currentRun.payslips?.reduce((s, p) => s + p.netPay, 0) || 0)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {currentRun.status === 'draft' && (
                <button onClick={approve} disabled={actionLoading} className="btn-primary w-full justify-center h-full">
                  {actionLoading ? <Loader className="animate-spin" size={18} /> : <Check size={18} />} Approve
                </button>
              )}
              {currentRun.status === 'approved' && (
                <button onClick={lock} disabled={actionLoading} className="btn-danger w-full justify-center h-full">
                  {actionLoading ? <Loader className="animate-spin" size={18} /> : <Lock size={18} />} Lock Payroll
                </button>
              )}
              {currentRun.status === 'locked' && (
                <button onClick={downloadBankFile} className="btn-success w-full justify-center h-full">
                  <Download size={18} /> Bank File
                </button>
              )}
            </div>
          </div>

          {/* Payslip Table */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3 sticky left-0 bg-gray-50">Employee</th>
                    <th className="px-4 py-3 text-center">W.Days</th>
                    <th className="px-4 py-3 text-center">P.Days</th>
                    <th className="px-4 py-3 text-center">LWP</th>
                    <th className="px-4 py-3 text-right">Gross Pay</th>
                    <th className="px-4 py-3 text-right">LWP Ded.</th>
                    <th className="px-4 py-3 text-right">Other Ded.</th>
                    <th className="px-4 py-3 text-right font-bold text-primary">Net Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentRun.payslips.map(p => {
                    const lwpLine = p.deductionsJson.find(d => d.name.includes('LWP'))?.amount || 0;
                    const otherDed = p.totalDeductions - lwpLine;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 sticky left-0 bg-white border-r">
                          <p className="font-bold text-gray-800">{p.employee.user.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">{p.employee.empCode}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-600">{p.workingDays}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-600">{p.presentDays}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-400">{p.lwpDays}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">{formatINR(p.grossPayable)}</td>
                        <td className="px-4 py-3 text-right font-bold text-red-500">{lwpLine > 0 ? `-${formatINR(lwpLine)}` : '—'}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-500">{formatINR(otherDed)}</td>
                        <td className="px-4 py-3 text-right font-black text-primary text-sm">{formatINR(p.netPay)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
