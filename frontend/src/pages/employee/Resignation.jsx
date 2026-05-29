import { useState, useEffect } from 'react';
import { Calendar, FileText, Send, Download, AlertCircle, CheckCircle, XCircle, Clock, Undo } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function Resignation() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lastWorkingDay: '', reason: '' });

  useEffect(() => { fetchResignations(); }, []);

  const fetchResignations = async () => {
    try {
      const res = await api.get('/resignations');
      setResignations(res.data.data);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lastWorkingDay || !form.reason) return toast.error('All fields required');
    
    setSubmitting(true);
    try {
      await api.post('/resignations/apply', form);
      toast.success('Resignation request submitted');
      setShowForm(false);
      setForm({ lastWorkingDay: '', reason: '' });
      fetchResignations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const withdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw your resignation?')) return;
    try {
      await api.patch(`/resignations/${id}/withdraw`);
      toast.success('Resignation withdrawn');
      fetchResignations();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const downloadLetter = async (id) => {
    try {
      const res = await api.get(`/resignations/${id}/letter`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Resignation_Acceptance.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Download failed');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const activeRes = resignations.find(r => ['pending', 'approved'].includes(r.status));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Resignation</h1>
          <p className="text-sm text-gray-500">Submit and track your resignation request</p>
        </div>
        {!activeRes && !showForm && (
          <Button onClick={() => setShowForm(true)} className="btn-primary">
            <Send size={18} /> Apply for Resignation
          </Button>
        )}
      </div>

      {showForm && (
        <Card title="New Resignation Request" className="border-primary/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Last Working Day"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.lastWorkingDay}
                onChange={e => setForm({ ...form, lastWorkingDay: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Resignation</label>
              <textarea
                className="input-base min-h-[120px]"
                placeholder="Briefly explain the reason for leaving..."
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                required
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p>Note: Once approved, your last working day will be set in the system. You will retain access to the portal until that date.</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</Button>
              <Button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting...' : 'Submit Resignation'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {resignations.length === 0 && !showForm ? (
        <EmptyState
          icon={FileText}
          title="No Resignation Records"
          description="You haven't submitted any resignation requests yet."
          action={<Button onClick={() => setShowForm(true)} variant="primary">Start Application</Button>}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Your History</p>
          {resignations.map(r => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    r.status === 'approved' ? 'bg-green-50 text-green-600' :
                    r.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {r.status === 'approved' ? <CheckCircle size={24} /> :
                     r.status === 'pending' ? <Clock size={24} /> :
                     <XCircle size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">Last Working Day: {format(new Date(r.lastWorkingDay), 'dd MMM yyyy')}</p>
                      <Badge variant={
                        r.status === 'approved' ? 'success' :
                        r.status === 'pending' ? 'warning' :
                        'danger'
                      }>
                        {r.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{r.reason}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Applied on {format(new Date(r.appliedAt), 'dd MMM yyyy')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {r.status === 'approved' && (
                    <Button onClick={() => downloadLetter(r.id)} className="btn-secondary py-2 text-xs">
                      <Download size={14} /> Acceptance Letter
                    </Button>
                  )}
                  {r.status === 'pending' && (
                    <Button onClick={() => withdraw(r.id)} className="btn-ghost text-red-500 py-2 text-xs">
                      <Undo size={14} /> Withdraw
                    </Button>
                  )}
                </div>
              </div>
              {r.remarks && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                  <span className="font-bold text-gray-700">Admin Remarks:</span> {r.remarks}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
