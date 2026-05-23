import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function SalaryTemplates() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ name: '', components: [] });
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    const res = await api.get('/salary-templates');
    setTemplates(res.data.data);
  };

  const addRow = () => setForm({ ...form, components: [...form.components, { name: '', type: 'earning', basis: 'fixed', value: 0, sequence: form.components.length + 1 }] });

  const saveTemplate = async () => {
    try {
      if (isEditing) await api.put(`/salary-templates/${isEditing}`, form);
      else await api.post('/salary-templates', form);
      toast.success('Template saved');
      setForm({ name: '', components: [] });
      setIsEditing(null);
      fetchTemplates();
    } catch { toast.error('Save failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4">{isEditing ? 'Edit' : 'New'} Salary Template</h2>
        <input className="w-full border p-2 mb-4 rounded" placeholder="Template Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        {form.components.map((c, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="border p-2 rounded flex-1" placeholder="Name" value={c.name} onChange={e => {
              const comps = [...form.components]; comps[i].name = e.target.value; setForm({...form, components: comps});
            }} />
            <select className="border p-2 rounded" value={c.type} onChange={e => {
              const comps = [...form.components]; comps[i].type = e.target.value; setForm({...form, components: comps});
            }}>
              <option value="earning">Earning</option><option value="deduction">Deduction</option>
            </select>
          </div>
        ))}
        <button onClick={addRow} className="text-primary text-sm flex items-center gap-1">+ Add Component</button>
        <button onClick={saveTemplate} className="bg-primary text-white px-6 py-2 rounded-lg mt-4 w-full">Save Template</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
            <h3 className="font-bold">{t.name}</h3>
            <button onClick={() => { setIsEditing(t.id); setForm(t); }} className="text-blue-600"><Edit2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
