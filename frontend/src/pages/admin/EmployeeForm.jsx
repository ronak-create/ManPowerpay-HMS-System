import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [meta, setMeta] = useState({ sites: [], departments: [], templates: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchMeta();
    if (isEdit) fetchEmployee();
  }, [id]);

  const fetchMeta = async () => {
    const res = await api.get('/employees/meta');
    setMeta(res.data.data);
  };

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      const data = res.data.data;
      reset({
        ...data,
        name: data.user.name,
        email: data.user.email,
        mobile: data.user.mobile,
        dateOfJoining: data.dateOfJoining ? data.dateOfJoining.split('T')[0] : '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        epfApplicable: data.epfApplicable !== null && data.epfApplicable !== undefined ? String(data.epfApplicable) : '',
        esicApplicable: data.esicApplicable !== null && data.esicApplicable !== undefined ? String(data.esicApplicable) : '',
        ptApplicable: data.ptApplicable !== null && data.ptApplicable !== undefined ? String(data.ptApplicable) : '',
        tdsProjectedTax: data.tdsProjectedTax !== null && data.tdsProjectedTax !== undefined ? data.tdsProjectedTax : '',
      });
    } catch (err) {
      toast.error('Failed to load employee');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, data);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', data);
        toast.success('Employee created');
      }
      navigate('/admin/employees');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'assignment', label: 'Assignment' },
    { id: 'personal', label: 'Personal' },
    { id: 'statutory', label: 'Statutory' },
    { id: 'statutory_overrides', label: 'Statutory Overrides' },
    { id: 'bank', label: 'Bank' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Employee' : 'New Employee'}</h1>
        <button onClick={handleSubmit(onSubmit)} disabled={loading} className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition disabled:opacity-50">
          <Save size={18} /> {loading ? 'Saving...' : 'Save Employee'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-primary text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form className="p-6 space-y-6">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input {...register('name', { required: true })} className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" {...register('email', { required: true })} className="w-full border rounded-lg px-4 py-2" disabled={isEdit} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input {...register('mobile', { required: true })} className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input {...register('empCode', { required: true })} className="w-full border rounded-lg px-4 py-2" disabled={isEdit} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input {...register('designation', { required: true })} className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                <input type="date" {...register('dateOfJoining', { required: true })} className="w-full border rounded-lg px-4 py-2" />
              </div>
            </div>
          )}

          {activeTab === 'assignment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                <select {...register('siteId')} className="w-full border rounded-lg px-4 py-2">
                  <option value="">Select Site</option>
                  {meta.sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select {...register('departmentId')} className="w-full border rounded-lg px-4 py-2">
                  <option value="">Select Department</option>
                  {meta.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Template</label>
                <select {...register('salaryTemplateId')} className="w-full border rounded-lg px-4 py-2">
                  <option value="">Select Template</option>
                  {meta.templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual CTC</label>
                <input type="number" {...register('annualCTC')} className="w-full border rounded-lg px-4 py-2" />
              </div>
            </div>
          )}

          {/* ... Other tabs follow similar pattern ... */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" {...register('dateOfBirth')} className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select {...register('gender')} className="w-full border rounded-lg px-4 py-2">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea {...register('address')} className="w-full border rounded-lg px-4 py-2" rows="3"></textarea>
              </div>
            </div>
          )}

          {activeTab === 'statutory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input {...register('pfAccountNo')} placeholder="PF Account No" className="w-full border rounded-lg px-4 py-2" />
              <input {...register('uanNo')} placeholder="UAN No" className="w-full border rounded-lg px-4 py-2" />
              <input {...register('esicNo')} placeholder="ESIC No" className="w-full border rounded-lg px-4 py-2" />
              <input {...register('pan')} placeholder="PAN" className="w-full border rounded-lg px-4 py-2" />
              <input {...register('aadhaarNo')} placeholder="Aadhaar No" className="w-full border rounded-lg px-4 py-2" />
            </div>
          )}

          {activeTab === 'statutory_overrides' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <strong>Note:</strong> Leave any field blank to use the default from the salary template / company settings.
                Set explicitly to override for this employee only.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EPF Applicable</label>
                  <select {...register('epfApplicable')} className="w-full border rounded-lg px-4 py-2">
                    <option value="">Use Template Default</option>
                    <option value="true">Yes — Deduct EPF</option>
                    <option value="false">No — Exempt from EPF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ESIC Applicable</label>
                  <select {...register('esicApplicable')} className="w-full border rounded-lg px-4 py-2">
                    <option value="">Use Template Default</option>
                    <option value="true">Yes — Deduct ESIC</option>
                    <option value="false">No — Exempt from ESIC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Tax (PT) Applicable</label>
                  <select {...register('ptApplicable')} className="w-full border rounded-lg px-4 py-2">
                    <option value="">Use Company Default (On)</option>
                    <option value="true">Yes — Deduct PT</option>
                    <option value="false">No — Exempt from PT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TDS — Projected Annual Tax (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    {...register('tdsProjectedTax')}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="Leave blank for auto / 0 for exempt"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Set to 0 to mark employee as TDS-exempt. Leave blank to use payroll run default.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input {...register('bankName')} placeholder="Bank Name" className="w-full border rounded-lg px-4 py-2" />
              <input {...register('bankAccountNo')} placeholder="Account Number" className="w-full border rounded-lg px-4 py-2" />
              <input {...register('ifscCode')} placeholder="IFSC Code" className="w-full border rounded-lg px-4 py-2" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
