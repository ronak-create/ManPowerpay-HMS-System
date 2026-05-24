import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function CompanySettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [company, setCompany] = useState(null);

  useEffect(() => { fetchCompany(); }, []);

  const fetchCompany = async () => {
    try {
      const res = await api.get('/company');
      setCompany(res.data.data);
    } catch { toast.error('Failed to load company'); }
  };

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'holidays', label: 'Holidays' },
    { id: 'pt', label: 'PT Slabs' },
    { id: 'structure', label: 'Structure' },
  ];

  if (!company) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">Company Settings</h1>
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>
      
      <Card>
        {activeTab === 'general' && <p>General settings implementation pending.</p>}
        {activeTab === 'holidays' && <p>Holiday management implementation pending.</p>}
        {activeTab === 'pt' && <p>PT Slabs implementation pending.</p>}
        {activeTab === 'structure' && <p>Sites & Departments implementation pending.</p>}
      </Card>
    </div>
  );
}
