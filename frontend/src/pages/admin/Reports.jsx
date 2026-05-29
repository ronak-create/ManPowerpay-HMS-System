import { useState } from 'react';
import { Download, FileText, IndianRupee, Users, ShieldCheck, ChevronRight, Loader } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MONTH_NAMES } from '../../utils/formatCurrency';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [fyYear, setFyYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'attendance', label: 'Attendance Register', icon: ShieldCheck },
    { id: 'payroll', label: 'Payroll Summary', icon: IndianRupee },
    { id: 'headcount', label: 'Headcount', icon: Users },
    { id: 'statutory', label: 'Statutory & Form 16', icon: FileText },
    { id: 'advance', label: 'Advance Ledger', icon: IndianRupee },
  ];

  const downloadReport = async (endpoint, filename) => {
    setLoading(true);
    try {
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const generateAllForm16 = async () => {
    setLoading(true);
    try {
      const res = await api.post('/form16/generate-all', { year: fyYear });
      const { generated, failed } = res.data.data;
      toast.success(`Generated ${generated} Form 16 summaries. ${failed.length} failed.`);
    } catch (err) {
      toast.error('Failed to trigger generation');
    } finally {
      setLoading(false);
    }
  };

  const ReportCard = ({ title, description, icon: Icon, onClick, actionLabel = "Download Excel" }) => (
    <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition group">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/5 text-amber-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 text-amber-700 font-bold hover:underline disabled:opacity-50"
      >
        {loading ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
        <span className="hidden sm:inline">{actionLabel}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-none">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0
              ${activeTab === t.id ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in space-y-6">
        {/* Filters for monthly reports */}
        {['attendance', 'payroll', 'statutory'].includes(activeTab) && activeTab !== 'form16_sub' && (
          <div className="card flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Select Month</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-base py-1.5 w-40">
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Select Year</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-base py-1.5 w-28">
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {activeTab === 'attendance' && (
            <ReportCard
              title="Attendance Register"
              description="Monthly attendance grid for all employees in Excel format."
              icon={ShieldCheck}
              onClick={() => downloadReport(`/reports/attendance?month=${month}&year=${year}&format=excel`, `Attendance_${month}_${year}.xlsx`)}
            />
          )}

          {activeTab === 'payroll' && (
            <ReportCard
              title="Payroll Summary Statement"
              description="Detailed breakdown of earnings, deductions, and net pay per employee."
              icon={IndianRupee}
              onClick={() => downloadReport(`/reports/payroll-summary?month=${month}&year=${year}&format=excel`, `Payroll_Summary_${month}_${year}.xlsx`)}
            />
          )}

          {activeTab === 'headcount' && (
            <ReportCard
              title="Employee Master / Headcount"
              description="Full list of active employees with all profile and statutory details."
              icon={Users}
              onClick={() => downloadReport('/reports/headcount?format=excel', 'Headcount_Report.xlsx')}
            />
          )}

          {activeTab === 'statutory' && (
            <div className="space-y-4">
              <ReportCard
                title="EPF ECR Export"
                description="Electronic Challan cum Return format for monthly EPF filing."
                icon={FileText}
                onClick={() => toast.error('Format integration in progress')}
                actionLabel="Download Text"
              />
              <ReportCard
                title="ESIC Monthly Return"
                description="Monthly contribution statement for ESIC portal upload."
                icon={FileText}
                onClick={() => toast.error('Format integration in progress')}
              />
              
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Form 16 / Salary Certificate</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Bulk generate annual tax summaries for all employees.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={fyYear}
                    onChange={(e) => setFyYear(Number(e.target.value))}
                    className="input-base py-2 w-32 bg-white"
                  >
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>FY {y-1}-{String(y).slice(-2)}</option>)}
                  </select>
                  <button
                    onClick={generateAllForm16}
                    disabled={loading}
                    className="btn-primary py-2.5 px-6 whitespace-nowrap shadow-lg shadow-primary/20"
                  >
                    {loading ? <Loader size={18} className="animate-spin" /> : 'Generate All'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advance' && (
            <ReportCard
              title="Salary Advance Ledger"
              description="Outstanding balances and EMI recovery status for all employee loans."
              icon={IndianRupee}
              onClick={() => downloadReport('/reports/advance-ledger?format=excel', 'Advance_Ledger.xlsx')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
