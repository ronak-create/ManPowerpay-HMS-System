import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Save, Calendar as CalendarIcon, AlertCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function AttendanceEntry() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // { empId: { status, otHours, reason } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const GRACE_PERIOD_DAYS = 3;
  const isPastGracePeriod = differenceInDays(new Date(), new Date(date)) > GRACE_PERIOD_DAYS;

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [year, month] = date.split('-');
      const res = await api.get(`/attendance/team?month=${month}&year=${year}`);
      const { employees, attendance } = res.data.data;
      
      setEmployees(employees);
      
      // Map existing attendance for the specific date
      const initialRows = {};
      employees.forEach(emp => {
        const record = attendance[emp.id]?.[date];
        initialRows[emp.id] = {
          status: record?.status || '',
          otHours: record?.otHours || 0,
          correctionReason: record?.correctionReason || ''
        };
      });
      setAttendanceData(initialRows);
      
      // Check if locked - would normally check payroll run status
      // For now, assume unlocked unless we implement a check
      setIsLocked(false); 

    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (empId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [empId]: { ...prev[empId], status }
    }));
  };

  const handleOTChange = (empId, otHours) => {
    setAttendanceData(prev => ({
      ...prev,
      [empId]: { ...prev[empId], otHours: parseFloat(otHours) || 0 }
    }));
  };

  const handleReasonChange = (empId, correctionReason) => {
    setAttendanceData(prev => ({
      ...prev,
      [empId]: { ...prev[empId], correctionReason }
    }));
  };

  const handleSave = async () => {
    const records = Object.entries(attendanceData)
      .filter(([_, data]) => data.status)
      .map(([empId, data]) => ({
        employeeId: empId,
        ...data
      }));

    if (records.length === 0) return toast.error('No attendance marked');

    // Validate reasons if past grace period
    if (isPastGracePeriod) {
      const missingReason = records.some(r => !r.correctionReason);
      if (missingReason) return toast.error('Correction reason required for all entries');
    }

    setSaving(true);
    try {
      await api.post('/attendance/bulk', { date, records });
      toast.success('Attendance saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const statuses = [
    { id: 'P', label: 'Present', color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },
    { id: 'A', label: 'Absent', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
    { id: 'H', label: 'Half Day', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
    { id: 'PL', label: 'Paid Leave', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
    { id: 'WO', label: 'Week Off', color: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' },
    { id: 'HO', label: 'Holiday', color: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Entry</h1>
          <p className="text-sm text-gray-500">Mark attendance for your team</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || isLocked}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save All</>}
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800">
          <Lock size={20} />
          <span className="font-medium">Attendance for this month is locked and cannot be edited.</span>
        </div>
      )}

      {isPastGracePeriod && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3 text-blue-800">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">Date is past grace period (3 days). Correction reasons are required.</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase w-24">OT (Hrs)</th>
                {isPastGracePeriod && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reason</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-400">Loading team...</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{emp.user.name}</div>
                    <div className="text-xs text-gray-500">{emp.empCode}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {statuses.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleStatusChange(emp.id, s.id)}
                          disabled={isLocked}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            attendanceData[emp.id]?.status === s.id
                              ? `${s.color.split(' ')[0]} ${s.color.split(' ')[1]} border-current ring-1 ring-current`
                              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {s.id}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      disabled={isLocked}
                      value={attendanceData[emp.id]?.otHours || 0}
                      onChange={(e) => handleOTChange(emp.id, e.target.value)}
                      className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </td>
                  {isPastGracePeriod && (
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        disabled={isLocked}
                        placeholder="Required for correction"
                        value={attendanceData[emp.id]?.correctionReason || ''}
                        onChange={(e) => handleReasonChange(emp.id, e.target.value)}
                        className={`w-full border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                          !attendanceData[emp.id]?.correctionReason ? 'border-red-200' : ''
                        }`}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
