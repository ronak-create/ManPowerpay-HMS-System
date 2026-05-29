import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Power,
  FileText,
  Upload,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  FilePlus,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Modal from "../../components/ui/Modal";

function BulkUploadModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [staged, setStaged] = useState([]); // Array of { ...row, isValid, errors, isSelected }
  const [step, setStep] = useState('upload'); // upload | review | results
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/employees/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStaged(res.data.data.map(r => ({ ...r, isSelected: r.isValid })));
      setStep('review');
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSave = async () => {
    const toSave = staged.filter(s => s.isSelected);
    if (!toSave.length) return toast.error("Select at least one valid row to save");
    
    const hasErrors = toSave.some(s => !s.isValid);
    if (hasErrors && !window.confirm("Some selected rows have validation errors. They might fail. Continue?")) return;

    if (!window.confirm(`Are you sure you want to import ${toSave.length} employees? This will create new user accounts.`)) return;

    setSaving(true);
    try {
      const res = await api.post("/employees/bulk-finalize", { employees: toSave });
      setResult(res.data.data);
      setStep('results');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Final save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleRow = (id) => {
    setStaged(prev => prev.map(r => r.id === id ? { ...r, isSelected: !r.isSelected } : r));
  };

  const removeRow = (id) => {
    setStaged(prev => prev.filter(r => r.id !== id));
  };

  const updateStagedRow = (id, field, value) => {
    setStaged(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const filteredStaged = staged.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.empCode.toLowerCase().includes(search.toLowerCase())
  );

  const downloadTemplate = async () => {
    try {
      const res = await api.get("/employees/bulk-template", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employee_bulk_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Failed to download template");
    }
  };

  const reset = () => {
    setFile(null);
    setStaged([]);
    setStep('upload');
    setResult(null);
  };

  return (
    <Modal open={open} onClose={() => { if (step === 'review' && !window.confirm("Discard staged changes?")) return; onClose(); reset(); }} title="Bulk Employee Upload" size={step === 'review' ? 'full' : 'lg'}>
      <div className="space-y-6">
        {step === 'upload' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-blue-800">Instructions</p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc ml-4">
                  <li>Download the Excel template and fill in the employee details.</li>
                  <li>Required fields: Name, Email, Mobile, Employee ID, Joining Date.</li>
                  <li>Email and Mobile must be unique across the system.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-10 px-4 bg-gray-50">
              <Upload className="text-gray-300 mb-4" size={48} />
              <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="bulk-file-input" />
              <label htmlFor="bulk-file-input" className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition">
                {file ? file.name : "Select Excel File"}
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button onClick={downloadTemplate} className="flex items-center gap-2 text-primary font-semibold hover:underline text-sm"><Download size={16} /> Download Template</button>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleUpload} disabled={loading || !file} className="btn-primary">{loading ? "Validating..." : "Upload & Review"}</button>
              </div>
            </div>
          </>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search in list..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <p className="text-sm font-medium text-gray-600">
                {staged.filter(s => s.isSelected).length} of {staged.length} selected
              </p>
            </div>

            <div className="border rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 w-10 sticky left-0 bg-gray-50 z-10"><input type="checkbox" checked={staged.length > 0 && staged.every(s => s.isSelected)} onChange={(e) => setStaged(prev => prev.map(r => ({ ...r, isSelected: e.target.checked })))} /></th>
                    <th className="p-3 whitespace-nowrap min-w-[150px]">Name*</th>
                    <th className="p-3 whitespace-nowrap min-w-[100px]">Emp Code*</th>
                    <th className="p-3 whitespace-nowrap min-w-[180px]">Email*</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">Mobile*</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">Designation*</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">Department</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">Site</th>
                    <th className="p-3 whitespace-nowrap min-w-[150px]">Salary Template</th>
                    <th className="p-3 whitespace-nowrap min-w-[100px]">CTC*</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">DOJ*</th>
                    <th className="p-3 whitespace-nowrap min-w-[100px]">Bank Name</th>
                    <th className="p-3 whitespace-nowrap min-w-[150px]">Account No</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">IFSC</th>
                    <th className="p-3 whitespace-nowrap min-w-[150px]">PF No</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">UAN</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">PAN</th>
                    <th className="p-3 whitespace-nowrap min-w-[120px]">Aadhaar</th>
                    <th className="p-3 whitespace-nowrap min-w-[100px]">Status</th>
                    <th className="p-3 w-10 sticky right-0 bg-gray-50 z-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStaged.map((r) => (
                    <tr key={r.id} className={`${!r.isValid ? 'bg-red-50' : r.isSelected ? 'bg-blue-50/30' : ''} hover:bg-gray-50/50`}>
                      <td className="p-3 sticky left-0 bg-inherit z-10"><input type="checkbox" checked={r.isSelected} onChange={() => toggleRow(r.id)} /></td>
                      <td className="p-1"><input value={r.name} onChange={e => updateStagedRow(r.id, 'name', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.empCode} onChange={e => updateStagedRow(r.id, 'empCode', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded font-mono" /></td>
                      <td className="p-1"><input value={r.email} onChange={e => updateStagedRow(r.id, 'email', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.mobile} onChange={e => updateStagedRow(r.id, 'mobile', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.designation} onChange={e => updateStagedRow(r.id, 'designation', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.department} onChange={e => updateStagedRow(r.id, 'department', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" placeholder="Matching name..." /></td>
                      <td className="p-1"><input value={r.site} onChange={e => updateStagedRow(r.id, 'site', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" placeholder="Matching name..." /></td>
                      <td className="p-1"><input value={r.salaryTemplate} onChange={e => updateStagedRow(r.id, 'salaryTemplate', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" placeholder="Matching name..." /></td>
                      <td className="p-1"><input type="number" value={r.annualCTC} onChange={e => updateStagedRow(r.id, 'annualCTC', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input type="date" value={r.doj} onChange={e => updateStagedRow(r.id, 'doj', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.bankName || ''} onChange={e => updateStagedRow(r.id, 'bankName', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.bankAccountNo || ''} onChange={e => updateStagedRow(r.id, 'bankAccountNo', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.ifscCode || ''} onChange={e => updateStagedRow(r.id, 'ifscCode', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.pfAccountNo || ''} onChange={e => updateStagedRow(r.id, 'pfAccountNo', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.uanNo || ''} onChange={e => updateStagedRow(r.id, 'uanNo', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.pan || ''} onChange={e => updateStagedRow(r.id, 'pan', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-1"><input value={r.aadhaarNo || ''} onChange={e => updateStagedRow(r.id, 'aadhaarNo', e.target.value)} className="w-full bg-transparent border-none p-1 focus:ring-1 rounded" /></td>
                      <td className="p-3">
                        {r.isValid ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={14} /> Ready</span>
                            {r.info?.map((info, idx) => (
                              <span key={idx} className="text-[9px] text-blue-600 font-medium leading-none">{info}</span>
                            ))}
                          </div>
                        ) : (
                          <div className="group relative">
                            <span className="text-red-600 font-bold flex items-center gap-1 cursor-help"><AlertCircle size={14} /> Error</span>
                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white p-2 rounded text-[10px] w-48 z-10 shadow-xl">
                              {r.errors.join(', ')}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-2 sticky right-0 bg-inherit z-10">
                        <button onClick={() => removeRow(r.id)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setStep('upload')} className="btn-secondary">Back</button>
              <button onClick={handleFinalSave} disabled={saving} className="btn-primary">
                {saving ? "Creating Employees..." : `Import ${staged.filter(s => s.isSelected).length} Employees`}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Import Complete</h3>
            <p className="text-gray-500 mt-2">Successfully created {result.created} employee records.</p>
            {result.failed.length > 0 && (
              <div className="mt-6 text-left max-w-md mx-auto">
                <p className="text-sm font-bold text-red-600 mb-2">Errors in {result.failed.length} rows:</p>
                <div className="max-h-40 overflow-y-auto border rounded-xl p-3 text-xs bg-red-50 text-red-800">
                  {result.failed.map((f, i) => (
                    <p key={i}>• {f.empCode}: {f.reason}</p>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => { onClose(); reset(); }} className="btn-primary mt-8 px-10">Close</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ sites: [] });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    siteId: "",
    isActive: "true",
  });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [generating, setGenerating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeta();
    fetchEmployees();
  }, [filters]);

  const fetchMeta = async () => {
    try {
      const res = await api.get("/employees/meta");
      setMeta(res.data.data);
    } catch (err) {
      toast.error("Failed to load filters");
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employees", { params: filters });
      setEmployees(res.data.data.employees);
    } catch (err) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/employees/${id}/status`, { isActive: !currentStatus });
      toast.success(`Employee ${!currentStatus ? "activated" : "deactivated"}`);
      fetchEmployees();
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const downloadLetter = async (id, empCode) => {
  setDownloading(id);
  try {
    const res = await api.get(`/employees/${id}/appointment-letter`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: 'application/pdf' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${empCode}_Appointment_Letter.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    // Error response is a Blob when responseType:'blob' — must convert to read it
    let message = 'Generation failed';
    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try { message = JSON.parse(text).message; } catch { message = text; }
    }
    console.error('Letter error:', message);
    toast.error(message);
  } finally {
    setDownloading(null);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <Upload size={18} /> Bulk Upload
          </button>
          <button
            onClick={() => navigate("/admin/employees/new")}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition"
          >
            <Plus size={18} /> Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search code, name, designation..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={filters.siteId}
          onChange={(e) => setFilters({ ...filters, siteId: e.target.value })}
        >
          <option value="">All Sites</option>
          {meta.sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
        >
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
          <option value="">All Status</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Emp Code
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Designation
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Site
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {emp.empCode}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{emp.user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.designation}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {emp.site?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${emp.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => downloadLetter(emp.id, emp.empCode)}
                        disabled={downloading === emp.id}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title="Download Appointment Letter"
                      >
                        {downloading === emp.id ? (
                          <span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/employees/${emp.id}/edit`)
                        }
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleStatus(emp.id, emp.isActive)}
                        className={`p-1.5 rounded ${emp.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}
                        title={emp.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BulkUploadModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={fetchEmployees}
      />
    </div>
  );
}
