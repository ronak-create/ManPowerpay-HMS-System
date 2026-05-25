import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Loader, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';

function BulkUploadModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/attendance/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Attendance uploaded successfully');
      onSuccess();
      onClose();
    } catch (err) { toast.error('Upload failed'); } finally { setLoading(false); }
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/attendance/bulk-template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_template.xlsx');
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err) { toast.error('Failed to download template'); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk Attendance Upload" size="md">
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-8">
          <Upload className="text-gray-300 mb-2" size={32} />
          <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="at-file" />
          <label htmlFor="at-file" className="text-sm font-semibold text-primary cursor-pointer hover:underline">{file ? file.name : 'Select Excel file'}</label>
        </div>
        <div className="flex justify-between items-center">
          <button onClick={downloadTemplate} className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">Download Template</button>
          <button onClick={handleUpload} disabled={loading || !file} className="btn-primary">{loading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </div>
    </Modal>
  );
}

export default function AttendanceEntry() {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  const statuses = [
    { id: 'P', color: 'bg-green-500 text-white border-green-600' },
    { id: 'A', color: 'bg-red-500 text-white border-red-600' },
    { id: 'H', color: 'bg-amber-500 text-white border-amber-600' },
    { id: 'PL', color: 'bg-blue-500 text-white border-blue-600' },
    { id: 'WO', color: 'bg-gray-400 text-white border-gray-500' },
    { id: 'HO', color: 'bg-purple-500 text-white border-purple-600' }
  ];

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        api.get('/employees?isActive=true'),
        api.get(`/attendance/team?month=${date.split('-')[1]}&year=${date.split('-')[0]}`)
      ]);
      
      const emps = empRes.data.data.employees;
      setEmployees(emps);
      
      const attendance = attRes.data.data.attendance;
      const dataMap = {};
      emps.forEach(emp => {
        const rec = attendance[emp.id]?.[date] || { status: 'P', otHours: 0 };
        dataMap[emp.id] = { status: rec.status, otHours: rec.otHours || 0, isLocked: rec.isLocked };
      });
      setAttendanceData(dataMap);
      setIsLocked(Object.values(dataMap).some(d => d.isLocked));
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (empId, status) => {
    setAttendanceData(prev => ({ ...prev, [empId]: { ...prev[empId], status } }));
  };

  const handleOTChange = (empId, otHours) => {
    setAttendanceData(prev => ({ ...prev, [empId]: { ...prev[empId], otHours: Number(otHours) } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceData).map(([employeeId, data]) => ({
        employeeId,
        status: data.status,
        otHours: data.otHours
      }));
      await api.post('/attendance/bulk', { date, records });
      toast.success('Attendance saved');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Attendance Entry</h1>
          <p className="page-subtitle">Mark daily attendance for the team</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowBulk(true)} className="btn-secondary">Bulk Upload</button>
          <div className="relative flex-1 sm:flex-none">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || isLocked}
            className="btn-primary flex-1 sm:flex-none justify-center"
          >
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Save All
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm">
          Attendance for this date is locked due to payroll processing.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">OT Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="3" className="text-center py-10 text-gray-400">Loading team...</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{emp.user.name}</p>
                    <p className="text-xs text-gray-400">{emp.empCode}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-1.5">
                      {statuses.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleStatusChange(emp.id, s.id)}
                          disabled={isLocked}
                          className={`w-10 h-10 rounded-lg border text-xs font-bold transition ${
                            attendanceData[emp.id]?.status === s.id
                              ? `${s.color}`
                              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {s.id}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      disabled={isLocked}
                      value={attendanceData[emp.id]?.otHours || 0}
                      onChange={e => handleOTChange(emp.id, e.target.value)}
                      className="w-20 border rounded-lg px-3 py-2 text-sm mx-auto block"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <BulkUploadModal open={showBulk} onClose={() => setShowBulk(false)} onSuccess={fetchData} />
    </div>
  );
}
