import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/reports/audit-logs');
      setLogs(res.data.data.logs);
      setTotal(res.data.data.total);
    } catch { toast.error('Failed to load logs'); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs ({total})</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-b">
                <td className="p-3">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-3">{l.user.name} ({l.user.role})</td>
                <td className="p-3 font-mono">{l.action}</td>
                <td className="p-3">{l.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
