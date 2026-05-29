import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users, ShieldCheck, Save, Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';

export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // { id, action }
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  // Balance Init Form
  const [initForm, setInitForm] = useState({ employeeId: '', CL: 12, PL: 15, SL: 6, year: new Date().getFullYear() });

  useEffect(() => {
    if (activeTab === 'approvals') fetchLeaves();
    if (activeTab === 'allocation') fetchMeta();
  }, [activeTab]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves?status=pending');
      setLeaves(res.data.data);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  const fetchMeta = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees?isActive=true');
      setEmployees(res.data.data.employees);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  const handleAction = async () => {
    setProcessing(true);
    try {
      const endpoint = modal.action === 'approve' ? 'approve' : 'reject';
      await api.patch(`/leaves/${modal.id}/${endpoint}`, { remarks });
      toast.success(`Leave ${modal.action}d`);
      setModal(null); setRemarks('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setProcessing(false); }
  };

  const initBalance = async (e) => {
    e.preventDefault();
    if (!initForm.employeeId) return toast.error('Please select an employee');
    setProcessing(true);
    try {
      await api.post('/leaves/balance/init', initForm);
      toast.success('Leave balance initialised');
      setInitForm({ ...initForm, employeeId: '' });
    } catch { toast.error('Failed to initialise'); }
    finally { setProcessing(false); }
  };

  const bulkInit = async () => {
    if (!window.confirm('This will set default balances (12 CL, 15 PL, 6 SL) for ALL active employees who don\'t have one. Continue?')) return;
    setProcessing(true);
    try {
      let count = 0;
      for (const emp of employees) {
        await api.post('/leaves/balance/init', { ...initForm, employeeId: emp.id });
        count++;
      }
      toast.success(`Initialised ${count} employees`);
    } catch { toast.error('Partial failure in bulk initialisation'); }
    finally { setProcessing(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Leave Management</h1>
        <p className="page-subtitle">Approve team requests and allocate leave balances</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'approvals' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Clock size={14} /> Pending Approvals
        </button>
        <button onClick={() => setActiveTab('allocation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'allocation' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <ShieldCheck size={14} /> Balance Allocation
        </button>
      </div>

      {activeTab === 'approvals' && (
        <div className="space-y-4 animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-12"><Loader className="animate-spin text-amber-700" /></div>
          ) : leaves.length === 0 ? (
            <div className="card text-center py-12 bg-gray-50 border-dashed border-2">
              <Clock size={40} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No pending leave requests</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {leaves.map(l => (
                <div key={l.id} className="card flex flex-col sm:flex-row sm:items-center gap-4 group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-amber-700 font-bold text-sm">
                      {l.employee?.user?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{l.employee?.user?.name}</p>
                      <p className="text-xs text-gray-500">{l.leaveType} · {l.totalDays} Day{l.totalDays > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 flex-1">
                    <p className="font-medium text-gray-800">{format(new Date(l.fromDate), 'dd MMM')} – {format(new Date(l.toDate), 'dd MMM yyyy')}</p>
                    <p className="text-xs text-gray-400 italic truncate max-w-xs">{l.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal({ id: l.id, action: 'approve' })}
                      className="btn-success text-xs py-1.5 px-3 rounded-lg"><CheckCircle size={14} /> Approve</button>
                    <button onClick={() => setModal({ id: l.id, action: 'reject' })}
                      className="btn-danger text-xs py-1.5 px-3 rounded-lg"><XCircle size={14} /> Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Form */}
          <div className="lg:col-span-1">
            <form onSubmit={initBalance} className="card space-y-4 sticky top-6">
              <h3 className="font-bold text-gray-900 border-b pb-3">Set Employee Balance</h3>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Employee</label>
                <select 
                  value={initForm.employeeId} 
                  onChange={e => setInitForm({...initForm, employeeId: e.target.value})}
                  className="input-base"
                >
                  <option value="">Choose Employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.user.name} ({e.empCode})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CL</label>
                  <input type="number" value={initForm.CL} onChange={e => setInitForm({...initForm, CL: Number(e.target.value)})} className="input-base text-center" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">PL</label>
                  <input type="number" value={initForm.PL} onChange={e => setInitForm({...initForm, PL: Number(e.target.value)})} className="input-base text-center" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SL</label>
                  <input type="number" value={initForm.SL} onChange={e => setInitForm({...initForm, SL: Number(e.target.value)})} className="input-base text-center" />
                </div>
              </div>
              <button type="submit" disabled={processing} className="btn-primary w-full justify-center">
                {processing ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Save Balance
              </button>
              
              <div className="pt-4 border-t">
                <button type="button" onClick={bulkInit} disabled={processing} className="btn-secondary w-full justify-center text-xs">
                  Run Bulk Init (All Active)
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2">Sets default quotas for the current year</p>
              </div>
            </form>
          </div>

          {/* List/Stats (Simplified) */}
          <div className="lg:col-span-2">
            <div className="card h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50/50 border-dashed">
              <ShieldCheck size={48} className="text-gray-200 mb-4" />
              <h3 className="font-bold text-gray-500">Allocation Records</h3>
              <p className="text-sm text-gray-400 max-w-xs mt-1">Use the form to grant leave quotas. Employees need a balance before they can apply for anything except LWP.</p>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      <Modal 
        open={!!modal} 
        onClose={() => setModal(null)} 
        title={modal?.action === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Add any optional remarks or instructions for the employee.</p>
          <textarea 
            value={remarks} 
            onChange={e => setRemarks(e.target.value)}
            placeholder="Reason or notes..." 
            className="input-base resize-none" 
            rows={3} 
          />
          <div className="flex gap-2">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAction} disabled={processing} className={`${modal?.action === 'approve' ? 'btn-success' : 'btn-danger'} flex-1 justify-center`}>
              {processing ? <Loader className="animate-spin" size={16} /> : modal?.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
