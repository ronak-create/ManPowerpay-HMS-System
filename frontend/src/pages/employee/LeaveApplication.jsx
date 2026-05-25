import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function LeaveApplication() {
  const { user } = useAuthStore();
  const [balances, setBalances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const { register, handleSubmit, watch, reset } = useForm();
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [balRes, histRes] = await Promise.all([
      api.get(`/leaves/balance/${empId}`),
      api.get('/leaves')
    ]);
    setBalances(balRes.data.data);
    setLeaves(histRes.data.data);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {balances.map(b => (
          <div key={b.leaveType} className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="text-sm text-gray-500">{b.leaveType} Balance</div>
            <div className="text-2xl font-bold text-primary">{b.balance}</div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">Apply for Leave</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select {...register('leaveType', { required: true })} className="border p-2 rounded">
            <option value="CL">Casual Leave</option>
            <option value="PL">Privilege Leave</option>
            <option value="SL">Sick Leave</option>
            <option value="LWP">Leave Without Pay</option>
          </select>
          <input type="date" {...register('fromDate', { required: true })} className="border p-2 rounded" />
          <input type="date" {...register('toDate', { required: true })} className="border p-2 rounded" />
          <textarea {...register('reason', { required: true })} placeholder="Reason" className="border p-2 rounded col-span-2"></textarea>
          <button type="submit" className="bg-primary text-white py-2 rounded">Apply</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500">Type</th>
              <th className="p-4 text-xs font-bold text-gray-500">From</th>
              <th className="p-4 text-xs font-bold text-gray-500">To</th>
              <th className="p-4 text-xs font-bold text-gray-500">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id} className="border-b">
                <td className="p-4">{l.leaveType}</td>
                <td className="p-4">{new Date(l.fromDate).toLocaleDateString()}</td>
                <td className="p-4">{new Date(l.toDate).toLocaleDateString()}</td>
                <td className="p-4 capitalize">{l.status}</td>
                <td className="p-4">
                  {l.status === 'pending' && <button onClick={() => cancelLeave(l.id)} className="text-red-500 text-sm">Cancel</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
