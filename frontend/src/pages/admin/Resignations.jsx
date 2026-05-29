import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Download, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function Resignations() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedRes, setSelectedRes] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchResignations(); }, []);

  const fetchResignations = async () => {
    try {
      const res = await api.get('/resignations');
      setResignations(res.data.data);
    } catch (err) {
      toast.error('Failed to load resignations');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      if (action === 'approve') {
        await api.patch(`/resignations/${selectedRes.id}/approve`, { remarks });
        toast.success('Resignation approved');
      } else if (action === 'reject') {
        await api.patch(`/resignations/${selectedRes.id}/reject`, { remarks });
        toast.success('Resignation rejected');
      } else if (action === 'purge') {
        await api.delete(`/resignations/purge/${selectedRes.employeeId}`);
        toast.success('Employee data purged');
      }
      fetchResignations();
      setShowApproveModal(false);
      setShowRejectModal(false);
      setShowPurgeConfirm(false);
      setSelectedRes(null);
      setRemarks('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const downloadLetter = async (id) => {
    try {
      const res = await api.get(`/resignations/${id}/letter`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Resignation_Acceptance.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const filtered = resignations.filter(r => {
    const matchesSearch = r.employee.user.name.toLowerCase().includes(search.toLowerCase()) || 
                          r.employee.empCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Resignation Management</h1>
          <p className="text-sm text-gray-500">Review and manage employee offboarding requests</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search employee name or code..."
            className="input-base pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="input-base min-w-[150px]"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(r => {
          const isLwdPassed = new Date(r.lastWorkingDay) < new Date();
          return (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                    {r.employee.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{r.employee.user.name}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{r.employee.empCode}</span>
                      <Badge variant={
                        r.status === 'approved' ? 'success' :
                        r.status === 'pending' ? 'warning' :
                        'danger'
                      }>
                        {r.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1"><span className="font-semibold">Reason:</span> {r.reason}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Applied: {format(new Date(r.appliedAt), 'dd MMM yyyy')}</p>
                      <p className={`text-[10px] uppercase font-bold tracking-tight ${isLwdPassed ? 'text-red-500' : 'text-blue-500'}`}>
                        LWD: {format(new Date(r.lastWorkingDay), 'dd MMM yyyy')} {isLwdPassed && '(PASSED)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {r.status === 'pending' && (
                    <>
                      <Button onClick={() => { setSelectedRes(r); setShowApproveModal(true); }} className="btn-primary py-1.5 text-xs">Approve</Button>
                      <Button onClick={() => { setSelectedRes(r); setShowRejectModal(true); }} className="btn-ghost text-red-500 py-1.5 text-xs">Reject</Button>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <>
                      <Button onClick={() => downloadLetter(r.id)} className="btn-secondary py-1.5 text-xs">
                        <Download size={14} /> Acceptance Letter
                      </Button>
                      {isLwdPassed && (
                        <Button onClick={() => { setSelectedRes(r); setShowPurgeConfirm(true); }} className="btn-ghost text-red-500 py-1.5 text-xs">
                          <Trash2 size={14} /> Purge Data
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-100 font-medium">
            No resignation records found
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal open={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve Resignation">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
            <strong>Warning:</strong> Approving this will set the employee's leaving date to <strong>{selectedRes && format(new Date(selectedRes.lastWorkingDay), 'dd MMM yyyy')}</strong>. 
            The user will be automatically deactivated after this date.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Remarks (Optional)</label>
            <textarea
              className="input-base min-h-[100px]"
              placeholder="Enter any notes or instructions..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={() => setShowApproveModal(false)} className="btn-secondary">Cancel</Button>
            <Button onClick={() => handleAction('approve')} disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Processing...' : 'Confirm Approval'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Resignation">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection *</label>
            <textarea
              className="input-base min-h-[100px]"
              placeholder="Provide a reason for rejecting the request..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={() => setShowRejectModal(false)} className="btn-secondary">Cancel</Button>
            <Button onClick={() => handleAction('reject')} disabled={actionLoading || !remarks} className="btn-danger">
              {actionLoading ? 'Processing...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Purge Confirm */}
      <ConfirmDialog
        open={showPurgeConfirm}
        onClose={() => setShowPurgeConfirm(false)}
        onConfirm={() => handleAction('purge')}
        title="Purge Employee Data"
        description="This will permanently delete all sensitive personal and financial information for this employee. Their name and basic employment record will be kept for audit purposes, but they will no longer be able to access the system. This cannot be undone."
        confirmText="Purge Data"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
