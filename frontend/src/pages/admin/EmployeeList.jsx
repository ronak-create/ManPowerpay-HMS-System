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
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file");
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/employees/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.data);
      if (res.data.data.created > 0) {
        toast.success(
          `Successfully created ${res.data.data.created} employees`,
        );
        onSuccess();
      }
      if (res.data.data.failed.length > 0) {
        toast.error(`${res.data.data.failed.length} rows failed to upload`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get("/employees/bulk-template", {
        responseType: "blob",
      });
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

  return (
    <Modal open={open} onClose={onClose} title="Bulk Employee Upload" size="lg">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-blue-800">Instructions</p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc ml-4">
              <li>
                Download the Excel template and fill in the employee details.
              </li>
              <li>
                Required fields: Name, Email, Mobile, Employee ID, Joining Date.
              </li>
              <li>Email and Mobile must be unique across the system.</li>
              <li>
                Department and Site names must match exactly as configured in
                settings.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-10 px-4 bg-gray-50">
          <Upload className="text-gray-300 mb-4" size={48} />
          <p className="text-sm text-gray-500 mb-4">
            Click to select or drag and drop Excel file (.xlsx)
          </p>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="bulk-file-input"
          />
          <label
            htmlFor="bulk-file-input"
            className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition"
          >
            {file ? file.name : "Select File"}
          </label>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-primary font-semibold hover:underline text-sm"
          >
            <Download size={16} /> Download Template
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary-light transition disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Employees"}
            </button>
          </div>
        </div>

        {result && result.failed.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-bold text-red-600 mb-2">
              Failed Rows ({result.failed.length})
            </p>
            <div className="max-h-40 overflow-y-auto rounded-lg border">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 border-b">Row</th>
                    <th className="px-3 py-2 border-b">Emp ID</th>
                    <th className="px-3 py-2 border-b">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.failed.map((f, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{f.row}</td>
                      <td className="px-3 py-2">{f.empCode}</td>
                      <td className="px-3 py-2 text-red-500">{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
