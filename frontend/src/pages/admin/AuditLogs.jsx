import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  // Date filters
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, from, to]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        '/reports/audit-logs',
        {
          params: {
            page,
            limit,
            from: from || undefined,
            to: to || undefined,
          },
        }
      );

      const data = res.data.data;

      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFrom('');
    setTo('');
    setPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Audit Logs ({total})
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">
            From
          </label>

          <input
            type="date"
            value={from}
            onChange={(e) => {
              setPage(1);
              setFrom(e.target.value);
            }}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            To
          </label>

          <input
            type="date"
            value={to}
            onChange={(e) => {
              setPage(1);
              setTo(e.target.value);
            }}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={clearFilters}
          className="border px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
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
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center"
                >
                  Loading...
                </td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map((l) => (
                <tr
                  key={l.id}
                  className="border-b"
                >
                  <td className="p-3">
                    {new Date(
                      l.createdAt
                    ).toLocaleString()}
                  </td>

                  <td className="p-3">
                    {l.user.name} (
                    {l.user.role})
                  </td>

                  <td className="p-3 font-mono">
                    {l.action}
                  </td>

                  <td className="p-3">
                    {l.entity}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-gray-500"
                >
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() =>
              setPage((p) => p - 1)
            }
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={() =>
              setPage((p) => p + 1)
            }
            disabled={
              page === totalPages
            }
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}