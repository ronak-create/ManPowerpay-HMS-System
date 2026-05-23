import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function MyAttendance() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [currentDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      // Assuming endpoint allows employee to fetch their own if empId is 'me' or similar, 
      // or we just use their real ID.
      const res = await api.get(`/attendance/employee/${user.id}?month=${month}&year=${year}`);
      setAttendance(res.data.data.calendar);
      setSummary(res.data.data.summary);
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  const statusColors = {
    P: 'bg-green-500 text-white',
    A: 'bg-red-500 text-white',
    H: 'bg-amber-500 text-white',
    PL: 'bg-blue-500 text-white',
    WO: 'bg-gray-400 text-white',
    HO: 'bg-indigo-500 text-white',
    LWP: 'bg-red-700 text-white',
  };

  const statusLabels = {
    P: 'Present',
    A: 'Absent',
    H: 'Half Day',
    PL: 'Paid Leave',
    WO: 'Week Off',
    HO: 'Holiday',
    LWP: 'Loss of Pay',
  };

  // Generate days for the grid (padding for start of month)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayOfWeek = monthStart.getDay(); // 0 (Sun) to 6 (Sat)
  const padding = Array.from({ length: startDayOfWeek }).map((_, i) => null);
  const calendarDays = [...padding, ...daysInMonth];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <div className="flex items-center gap-4 bg-white border rounded-lg px-4 py-2 shadow-sm">
          <button onClick={prevMonth} className="hover:text-primary transition"><ChevronLeft size={20} /></button>
          <span className="font-bold min-w-32 text-center">{format(currentDate, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="hover:text-primary transition"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="grid grid-cols-7 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {loading ? (
              Array.from({ length: 35 }).map((_, i) => <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-xl"></div>)
            ) : calendarDays.map((day, i) => {
              if (!day) return <div key={`p-${i}`} className="aspect-square"></div>;
              
              const dayStr = format(day, 'yyyy-MM-dd');
              const record = attendance.find(a => a.date === dayStr);
              const color = statusColors[record?.status] || 'bg-gray-50';
              
              return (
                <div key={dayStr} className="aspect-square border rounded-xl flex flex-col items-center justify-center relative hover:shadow-md transition group cursor-default">
                  <span className="text-sm font-medium text-gray-600 mb-1">{day.getDate()}</span>
                  {record?.status && (
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
                  )}
                  {record?.status && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/95 flex flex-col items-center justify-center rounded-xl transition-all scale-95 group-hover:scale-100">
                      <span className="text-[10px] font-bold uppercase text-gray-500">{statusLabels[record.status]}</span>
                      {record.otHours > 0 && <span className="text-[10px] text-primary font-bold">+{record.otHours}h OT</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Month Summary</h3>
            <div className="space-y-3">
              <SummaryItem icon={<CheckCircle className="text-green-500" size={18} />} label="Present Days" value={summary.present} />
              <SummaryItem icon={<XCircle className="text-red-500" size={18} />} label="Absent Days" value={summary.absent} />
              <SummaryItem icon={<AlertCircle className="text-amber-500" size={18} />} label="Half Days" value={summary.halfDay} />
              <SummaryItem icon={<Clock className="text-blue-500" size={18} />} label="Total OT Hours" value={summary.totalOT} />
            </div>
          </div>

          <div className="bg-primary rounded-2xl shadow-sm p-6 text-white">
            <h3 className="font-bold mb-2 opacity-80">Quick Legend</h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-400"></div> Present</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-400"></div> Absent</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-400"></div> Half Day</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-400"></div> Paid Leave</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-400"></div> Week Off</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-indigo-400"></div> Holiday</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value || 0}</span>
    </div>
  );
}
