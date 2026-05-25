import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function LeaveApplication() {
  const { user } = useAuthStore();
  const empId = user?.employee?.id;
  const [balances, setBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (empId) fetchData();
  }, [empId]);

  const fetchData = async () => {
    try {
      const [balRes, histRes] = await Promise.all([
        api.get(`/leaves/balance/${empId}?year=${new Date().getFullYear()}`),
        api.get('/leaves'),
      ]);
      setBalances(balRes.data.data);
      setLeaves(histRes.data.data);
    } catch {
      toast.error('Failed to load leave data');
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/leaves', data);
      toast.success('Leave applied');
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    }
  };

  const cancelLeave = async (id) => {
    try {
      await api.patch(`/leaves/${id}/cancel`);
      toast.success('Leave cancelled');
      fetchData();
    } catch (err) {
      toast.error('Cancellation failed');
    }
  };

  const leaveTypeLabel = {
    CL: 'Casual Leave',
    PL: 'Privilege Leave',
    SL: 'Sick Leave',
    LWP: 'Leave Without Pay',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Leave Application</h1>
        <p className="page-subtitle">Apply for leave and track your requests</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {balances.map((b) => (
          <div key={b.leaveType} className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-xs text-gray-500 font-medium">{leaveTypeLabel[b.leaveType] || b.leaveType}</div>
            <div className="text-3xl font-black text-primary mt-1">{b.balance}</div>
            <div className="text-xs text-gray-400 mt-0.5">{b.used} used of {b.total}</div>
          </div>
        ))}
        {balances.length === 0 && (
          <div className="col-span-4 text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-xl">
            Leave balances not initialized yet. Contact your administrator.
          </div>
        )}
      </div>

      {/* Apply form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">Apply for Leave</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Leave Type</label>
            <select {...register('leaveType', { required: true })} className="input-base">
              <option value="CL">Casual Leave</option>
              <option value="PL">Privilege Leave</option>
              <option value="SL">Sick Leave</option>
              <option value="LWP">Leave Without Pay</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">From Date</label>
            <input type="date" {...register('fromDate', { required: true })} className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">To Date</label>
            <input type="date" {...register('toDate', { required: true })} className="input-base" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Reason</label>
            <textarea {...register('reason', { required: true })} placeholder="Brief reason for leave" rows={3} className="input-base resize-none" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary">Apply for Leave</button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Leave History</h2>
        </div>
        {leaves.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No leave requests yet</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">From</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">To</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Days</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{l.leaveType}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(l.fromDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(l.toDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{l.totalDays}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      l.status === 'approved' ? 'bg-green-50 text-green-700' :
                      l.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      l.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {l.status === 'pending' && (
                      <button onClick={() => cancelLeave(l.id)} className="text-red-500 text-sm font-medium hover:underline">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}