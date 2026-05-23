import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Check, X } from 'lucide-react';

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const res = await api.get('/leaves?status=pending');
    setLeaves(res.data.data);
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/leaves/${id}/${action}`, { remarks: 'Approved by Supervisor' });
      toast.success(`Leave ${action}ed`);
      fetchLeaves();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-bold mb-4">Pending Leave Approvals</h2>
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-xs uppercase text-gray-500">Employee</th>
            <th className="p-3 text-xs uppercase text-gray-500">Type</th>
            <th className="p-3 text-xs uppercase text-gray-500">Dates</th>
            <th className="p-3 text-xs uppercase text-gray-500">Action</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map(l => (
            <tr key={l.id} className="border-b">
              <td className="p-3">{l.employee.user.name}</td>
              <td className="p-3">{l.leaveType}</td>
              <td className="p-3">{new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()}</td>
              <td className="p-3 flex gap-2">
                <button onClick={() => handleAction(l.id, 'approve')} className="text-green-600"><Check size={18}/></button>
                <button onClick={() => handleAction(l.id, 'reject')} className="text-red-600"><X size={18}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
