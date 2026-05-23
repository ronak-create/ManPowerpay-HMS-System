import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Power, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ sites: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', siteId: '', isActive: 'true' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeta();
    fetchEmployees();
  }, [filters]);

  const fetchMeta = async () => {
    try {
      const res = await api.get('/employees/meta');
      setMeta(res.data.data);
    } catch (err) {
      toast.error('Failed to load filters');
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees', { params: filters });
      setEmployees(res.data.data.employees);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/employees/${id}/status`, { isActive: !currentStatus });
      toast.success(`Employee ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchEmployees();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        <button
          onClick={() => navigate('/admin/employees/new')}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search code, name, designation..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={filters.siteId}
          onChange={(e) => setFilters({ ...filters, siteId: e.target.value })}
        >
          <option value="">All Sites</option>
          {meta.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
        >
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
          <option value="">All Status</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Emp Code</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Designation</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Site</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading employees...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-500">No employees found.</td></tr>
            ) : employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">{emp.empCode}</td>
                <td className="px-6 py-4 text-gray-600">{emp.user.name}</td>
                <td className="px-6 py-4 text-gray-600">{emp.designation}</td>
                <td className="px-6 py-4 text-gray-600">{emp.site?.name || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => navigate(`/admin/employees/${emp.id}/edit`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => toggleStatus(emp.id, emp.isActive)} className={`p-1.5 rounded ${emp.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={emp.isActive ? 'Deactivate' : 'Activate'}>
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
