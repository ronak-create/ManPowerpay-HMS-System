import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('attendance');

  const tabs = [
    { id: 'attendance', label: 'Attendance Register' },
    { id: 'payroll', label: 'Payroll Summary' },
    { id: 'headcount', label: 'Headcount' },
    { id: 'statutory', label: 'Statutory' },
    { id: 'advance', label: 'Advance Ledger' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Reports & MIS</h1>
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {activeTab === 'attendance' && <p>Attendance Register Content</p>}
        {activeTab === 'payroll' && <p>Payroll Summary Content</p>}
        {activeTab === 'headcount' && <p>Headcount Report Content</p>}
        {activeTab === 'statutory' && <p>Statutory Exports (EPF/ESIC/PT)</p>}
        {activeTab === 'advance' && <p>Advance Ledger Content</p>}
      </div>
    </div>
  );
}
