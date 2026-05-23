import { useState, useEffect } from 'react';
import { Plus, UserCog, Power, Users, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function SupervisorList() {
  const [supervisors, setSupervisors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchSupervisors();
    fetchSites();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const res = await api.get('/supervisors');
      setSupervisors(res.data.data);
    } catch (err) {
      toast.error('Failed to load supervisors');
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    const res = await api.get('/employees/meta');
    setSites(res.data.data.sites);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (editing) {
        await api.put(`/supervisors/${editing.id}`, data);
        toast.success('Supervisor updated');
      } else {
        await api.post('/supervisors', data);
        toast.success('Supervisor created');
      }
      setShowModal(false);
      setEditing(null);
      fetchSupervisors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/supervisors/${id}/status`, { isActive: !currentStatus });
      toast.success('Status updated');
      fetchSupervisors();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Supervisors</h1>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition"
        >
          <Plus size={18} /> Add Supervisor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-10 text-gray-500">Loading supervisors...</p>
        ) : supervisors.map(sup => (
          <div key={sup.id} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <UserCog size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{sup.user.name}</h3>
                  <p className="text-xs text-gray-500">{sup.user.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${sup.user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {sup.user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <span>{sup.site?.name || 'No Site Assigned'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <span>{sup._count.employees} Employees</span>
              </div>
            </div>

            <div className="pt-4 border-t flex gap-2">
              <button onClick={() => { setEditing(sup); setShowModal(true); }} className="flex-1 text-sm bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition">Edit</button>
              <button onClick={() => toggleStatus(sup.id, sup.user.isActive)} className={`flex-1 text-sm py-2 rounded-lg transition ${sup.user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {sup.user.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">{editing ? 'Edit Supervisor' : 'Add New Supervisor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input name="name" defaultValue={editing?.user.name} required className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" defaultValue={editing?.user.email} required className="w-full border rounded-lg px-4 py-2" disabled={!!editing} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile</label>
                <input name="mobile" defaultValue={editing?.user.mobile} required className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assigned Site</label>
                <select name="siteId" defaultValue={editing?.siteId} className="w-full border rounded-lg px-4 py-2">
                  <option value="">Select Site</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
