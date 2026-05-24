import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { id, action }
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchLeaves(); }, [filter]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const r = await api.get('/leaves', { params });
      setLeaves(r.data.data);
    } catch { toast.error('Failed to load leaves'); }
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

  const leaveTypeLabel = { CL: 'Casual Leave', PL: 'Privilege Leave', SL: 'Sick Leave', LWP: 'Leave Without Pay' };

  const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
    { id: 'all', label: 'All' },
  ];

  const pending = leaves.filter(l => l.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Leave Approvals</h1>
        <p className="page-subtitle">Review and action leave requests from your team</p>
      </div>

      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock size={20} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800">{pending.length} leave request{pending.length > 1 ? 's' : ''} pending your approval</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === t.id ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon && <t.icon size={13} />} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaves.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No {filter === 'all' ? '' : filter} leave requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(l => (
            <div key={l.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {l.employee?.user?.name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{l.employee?.user?.name}</p>
                  <p className="text-xs text-gray-500">{leaveTypeLabel[l.leaveType]} · {l.totalDays} day{l.totalDays > 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="text-sm text-gray-600 flex-shrink-0">
                <p className="font-medium">{format(new Date(l.fromDate), 'dd MMM')} – {format(new Date(l.toDate), 'dd MMM yyyy')}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-48">{l.reason}</p>
              </div>

              {/* Status + actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={l.status} />
                {l.status === 'pending' && (
                  <>
                    <button onClick={() => setModal({ id: l.id, action: 'approve' })}
                      className="btn-success text-xs px-3 py-1.5 rounded-lg">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => setModal({ id: l.id, action: 'reject' })}
                      className="btn-danger text-xs px-3 py-1.5 rounded-lg">
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setRemarks(''); }}
        title={modal?.action === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'}
        subtitle="Optionally add a remark for the employee"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleAction} disabled={processing}
              className={modal?.action === 'approve' ? 'btn-success' : 'btn-danger'}>
              {processing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {modal?.action === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        }
      >
        <textarea
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          placeholder="Optional remarks..."
          rows={3}
          className="input-base resize-none"
        />
      </Modal>
    </div>
  );
}
