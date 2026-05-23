import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Play, Check, Lock, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function PayrollRun() {
  const [step, setStep] = useState(1);
  const [runs, setRuns] = useState([]);
  const [currentRun, setCurrentRun] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setCurrentRun(res.data.data.run);
      setStep(2);
      fetchRuns();
    } catch (err) {
      toast.error('Failed to start payroll');
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    await api.patch(`/payroll/${currentRun.id}/approve`);
    toast.success('Approved');
    setStep(4);
  };

  const lock = async () => {
    await api.patch(`/payroll/${currentRun.id}/lock`);
    toast.success('Locked');
    fetchRuns();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payroll Management</h1>
      
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <button onClick={startPayroll} disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg">
            Process Payroll for {format(new Date(), 'MMMM yyyy')}
          </button>
          <div className="mt-6">
            <h2 className="font-bold mb-4">Past Runs</h2>
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50"><th className="p-3">Month</th><th className="p-3">Status</th></tr></thead>
              <tbody>{runs.map(r => <tr key={r.id} className="border-b"><td className="p-3">{r.month}/{r.year}</td><td className="p-3 capitalize">{r.status}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {step === 2 && currentRun && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-bold mb-4">Review Draft Payroll</h2>
          <button onClick={approve} className="bg-green-600 text-white px-6 py-2 rounded-lg">Approve Payroll</button>
        </div>
      )}

      {step === 4 && currentRun && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-bold mb-4">Payroll Locked</h2>
          <button onClick={() => window.location.href = `/api/payroll/${currentRun.id}/bank-file`} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg">
            <Download size={18} /> Download Bank File
          </button>
        </div>
      )}
    </div>
  );
}
