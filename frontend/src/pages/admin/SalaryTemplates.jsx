import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, X, IndianRupee, AlertCircle, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const PRESETS = [
  {
    label: 'Standard (Basic + HRA + TA)',
    components: [
      { name: 'Basic',              type: 'earning',              basis: 'percent_of_gross',  value: 50, sequence: 1,  isEpfApplicable: true,  isEsicApplicable: true,  isActive: true },
      { name: 'HRA',                type: 'earning',              basis: 'percent_of_basic',  value: 40, sequence: 2,  isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Travel Allowance',   type: 'earning',              basis: 'fixed',             value: 1600, sequence: 3, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Special Allowance',  type: 'earning',              basis: 'fixed',             value: 0,    sequence: 4, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Employee PF',        type: 'deduction',            basis: 'percent_of_basic',  value: 12,   sequence: 10, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Employee ESIC',      type: 'deduction',            basis: 'percent_of_gross',  value: 0.75, sequence: 11, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Professional Tax',   type: 'deduction',            basis: 'state_slab',        value: 0,    sequence: 12, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'TDS',                type: 'deduction',            basis: 'tds_formula',       value: 0,    sequence: 13, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Employer PF',        type: 'employer_contribution',basis: 'percent_of_basic',  value: 12,   sequence: 20, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Employer ESIC',      type: 'employer_contribution',basis: 'percent_of_gross',  value: 3.25, sequence: 21, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
    ],
  },
  {
    label: 'Flat Wage (No Statutory)',
    components: [
      { name: 'Basic Wage', type: 'earning',   basis: 'fixed', value: 0, sequence: 1, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
    ],
  },
  {
    label: 'Contract Staff',
    components: [
      { name: 'Basic',            type: 'earning',   basis: 'percent_of_gross',  value: 60,   sequence: 1,  isEpfApplicable: true,  isEsicApplicable: true,  isActive: true },
      { name: 'DA',               type: 'earning',   basis: 'percent_of_basic',  value: 20,   sequence: 2,  isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Employee PF',      type: 'deduction', basis: 'percent_of_basic',  value: 12,   sequence: 10, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Employee ESIC',    type: 'deduction', basis: 'percent_of_gross',  value: 0.75, sequence: 11, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
      { name: 'Professional Tax', type: 'deduction', basis: 'state_slab',        value: 0,    sequence: 12, isEpfApplicable: false, isEsicApplicable: false, isActive: true },
    ],
  },
];

function ComponentRow({ index, component, onChange, onRemove }) {
  const basisOptions = [
    { value: 'fixed',             label: 'Fixed ₹' },
    { value: 'percent_of_basic',  label: '% of Basic' },
    { value: 'percent_of_gross',  label: '% of Gross' },
    { value: 'per_day_absent',    label: 'Per Day Absent' },
    { value: 'ot_formula',        label: 'OT Formula' },
    { value: 'state_slab',        label: 'State Slab (PT)' },
    { value: 'tds_formula',       label: 'TDS Formula' },
    { value: 'manual',            label: 'Manual' },
  ];

  return (
    <tr className="group hover:bg-gray-50/50">
      <td className="px-3 py-2 text-xs text-gray-400 font-mono">{index + 1}</td>
      <td className="px-3 py-2">
        <input
          value={component.name}
          onChange={e => onChange({ ...component, name: e.target.value })}
          className="input-base py-1.5 text-xs w-full min-w-[120px]"
          placeholder="e.g. Basic, HRA"
        />
      </td>
      <td className="px-3 py-2">
        <select
          value={component.type}
          onChange={e => onChange({ ...component, type: e.target.value })}
          className="input-base py-1.5 text-xs w-full min-w-[110px]"
        >
          <option value="earning">Earning</option>
          <option value="deduction">Deduction</option>
          <option value="employer_contribution">Employer Contrib.</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={component.basis}
          onChange={e => onChange({ ...component, basis: e.target.value })}
          className="input-base py-1.5 text-xs w-full min-w-[130px]"
        >
          {basisOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={component.value}
          onChange={e => onChange({ ...component, value: Number(e.target.value) })}
          disabled={['state_slab', 'tds_formula', 'ot_formula'].includes(component.basis)}
          className="input-base py-1.5 text-xs w-20 disabled:bg-gray-100 disabled:text-gray-400"
          placeholder="0"
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={!!component.isEpfApplicable}
          onChange={e => onChange({ ...component, isEpfApplicable: e.target.checked })}
          className="w-4 h-4 rounded accent-primary"
          disabled={component.type !== 'earning'}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={!!component.isEsicApplicable}
          onChange={e => onChange({ ...component, isEsicApplicable: e.target.checked })}
          className="w-4 h-4 rounded accent-primary"
          disabled={component.type !== 'earning'}
        />
      </td>
      <td className="px-3 py-2">
        <button
          onClick={onRemove}
          className="btn-icon w-7 h-7 text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

export default function SalaryTemplates() {
  const [templates, setTemplates]       = useState([]);
  const [selected, setSelected]         = useState(null);   // template being viewed
  const [showEditor, setShowEditor]     = useState(false);  // editor panel open
  const [isEditing, setIsEditing]       = useState(null);   // id of template being edited, null = new
  const [form, setForm]                 = useState({ name: '', components: [] });
  const [saving, setSaving]             = useState(false);
  const [isDirty, setIsDirty]           = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/salary-templates');
      setTemplates(res.data.data);
    } catch (err) {
      toast.error('Failed to load templates');
    }
  };

  const selectTemplate = (t) => {
    setSelected(t);
    setShowEditor(true);
    setIsEditing(t.id);
    setForm({ name: t.name, components: t.components });
    setIsDirty(false);
  };

  const startNew = () => {
    setSelected(null);
    setShowEditor(true);
    setIsEditing(null);
    setForm({ name: '', components: [] });
    setIsDirty(false);
  };

  const resetEditor = () => {
    setShowEditor(false);
    setIsEditing(null);
    setSelected(null);
    setForm({ name: '', components: [] });
    setIsDirty(false);
  };

  const addRow = () => {
    const nextSeq = form.components.length > 0
      ? Math.max(...form.components.map(c => c.sequence)) + 1
      : 1;
    setForm(prev => ({
      ...prev,
      components: [
        ...prev.components,
        {
          name: '',
          type: 'earning',
          basis: 'fixed',
          value: 0,
          sequence: nextSeq,
          isEpfApplicable: false,
          isEsicApplicable: false,
          isActive: true,
        }
      ]
    }));
    setIsDirty(true);
  };

  const updateRow = (index, updated) => {
    const comps = [...form.components];
    comps[index] = updated;
    setForm({ ...form, components: comps });
    setIsDirty(true);
  };

  const removeRow = (index) => {
    setForm({ ...form, components: form.components.filter((_, i) => i !== index) });
    setIsDirty(true);
  };

  const loadPreset = (preset) => {
    setForm({ ...form, components: preset.components });
    setIsDirty(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/salary-templates/${id}`);
      toast.success('Template deleted');
      setDeleteConfirm(null);
      if (selected?.id === id) resetEditor();
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const saveTemplate = async () => {
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (form.components.length === 0) {
      toast.error('Add at least one salary component');
      return;
    }
    const unnamed = form.components.filter(c => !c.name.trim());
    if (unnamed.length > 0) {
      toast.error('All components must have a name');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/salary-templates/${isEditing}`, form);
        toast.success('Template updated');
      } else {
        await api.post('/salary-templates', form);
        toast.success('Template created');
      }
      resetEditor();
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Salary Templates</h1>
          <p className="text-sm text-gray-500">Manage earnings, deductions and statutory structures</p>
        </div>
        {!showEditor && (
          <button onClick={startNew} className="btn-primary">
            <Plus size={18} /> New Template
          </button>
        )}
      </div>

      {deleteConfirm && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">Delete this template?</p>
              <p className="text-xs text-red-700">Employees assigned to it will lose their template link.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary py-2 text-xs">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition shadow-sm">Confirm Delete</button>
          </div>
        </div>
      )}

      {templates.length === 0 && !showEditor ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <IndianRupee size={28} className="text-primary" />
          </div>
          <h3 className="font-bold text-gray-700 mb-1">No Salary Templates Yet</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-5">
            Templates define how employee salaries are structured — earnings, deductions, and statutory contributions.
          </p>
          <button onClick={startNew} className="btn-primary">
            <Plus size={15} /> Create First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel: List */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
              Available Templates ({templates.length})
            </p>
            {templates.map(t => {
              const earnings = t.components.filter(c => c.type === 'earning');
              const deductions = t.components.filter(c => c.type === 'deduction');
              return (
                <div
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className={`group cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    selected?.id === t.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-100 bg-white hover:border-gray-300 shadow-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <IndianRupee size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {earnings.length} earnings · {deductions.length} deductions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={(e) => { e.stopPropagation(); selectTemplate(t); }} className="btn-icon text-blue-500 hover:bg-blue-50">
                        <Pencil size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(t.id); }} className="btn-icon text-red-400 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {t.components.slice(0, 5).map(c => (
                      <span key={c.id} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.type === 'earning'
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                          : c.type === 'deduction'
                          ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                          : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                      }`}>
                        {c.name}
                      </span>
                    ))}
                    {t.components.length > 5 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                        +{t.components.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Editor */}
          <div className="lg:col-span-3">
            {showEditor ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {isEditing ? 'Edit Template' : 'New Template'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Define salary components, their type and calculation basis
                    </p>
                  </div>
                  <button onClick={resetEditor} className="btn-icon text-gray-400 hover:bg-gray-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Template Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={e => { setForm({ ...form, name: e.target.value }); setIsDirty(true); }}
                    className="input-base"
                    placeholder="e.g. Standard Template, Senior Staff, Contract Workers"
                  />
                </div>

                {form.components.length === 0 && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p className="text-xs font-bold text-blue-800 mb-2">Quick Start — Load a preset:</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESETS.map(p => (
                        <button
                          key={p.label}
                          onClick={() => loadPreset(p)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 transition"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Salary Components
                    </p>
                    <button onClick={addRow} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <Plus size={13} /> Add Component
                    </button>
                  </div>

                  <div className="rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">#</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Component Name</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Basis</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Value</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">EPF</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">ESIC</th>
                          <th className="px-3 py-2.5 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {form.components.map((c, i) => (
                          <ComponentRow
                            key={i}
                            index={i}
                            component={c}
                            onChange={(updated) => updateRow(i, updated)}
                            onRemove={() => removeRow(i)}
                          />
                        ))}
                        {form.components.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                              No components yet. Click "Add Component" to start.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 mt-2">
                    <span>• Fixed ₹ → absolute monthly amount</span>
                    <span>• % of Basic / Gross → enter percentage (e.g. 40 for 40%)</span>
                    <span>• State Slab / TDS / OT → auto-computed, value ignored</span>
                  </div>
                </div>

                {form.components.length > 0 && (() => {
                  const earnings   = form.components.filter(c => c.type === 'earning');
                  const deductions = form.components.filter(c => c.type === 'deduction');
                  const employer   = form.components.filter(c => c.type === 'employer_contribution');
                  return (
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4 flex-wrap">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-semibold uppercase">Earnings</p>
                        <p className="text-lg font-black text-green-600">{earnings.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-semibold uppercase">Deductions</p>
                        <p className="text-lg font-black text-red-500">{deductions.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-semibold uppercase">Employer Contrib.</p>
                        <p className="text-lg font-black text-purple-600">{employer.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-semibold uppercase">EPF-Applicable</p>
                        <p className="text-lg font-black text-primary">
                          {form.components.filter(c => c.isEpfApplicable).length}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
                  {isDirty && (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      <AlertCircle size={12} /> Unsaved changes
                    </span>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <button onClick={resetEditor} className="btn-secondary">
                      Cancel
                    </button>
                    <button onClick={saveTemplate} disabled={saving} className="btn-primary">
                      {saving
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Save size={15} />
                      }
                      {isEditing ? 'Update Template' : 'Create Template'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                  <Pencil size={20} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-500">No template selected</h3>
                <p className="text-sm text-gray-400 max-w-[200px] mt-1">
                  Click on a template from the list or create a new one to start editing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
