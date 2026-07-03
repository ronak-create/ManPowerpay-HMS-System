import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Building2,
  Calendar,
  IndianRupee,
  MapPin,
  Layers,
  Save,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle,
  Landmark,
  RotateCcw,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import api from "../../api/axios";

// ─── Reusable Field ──────────────────────────────────────────────────────────

function Field({ label, error, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5">⚠ {error}</p>}
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
    </div>
  );
}

// ─── TAB 1: Company Profile ──────────────────────────────────────────────────

function CompanyProfileTab({ company, onSaved }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: company.name || "",
      registeredAddress: company.registeredAddress || "",
      gstin: company.gstin || "",
      pan: company.pan || "",
      epfCode: company.epfCode || "",
      esicCode: company.esicCode || "",
      ptState: company.ptState || "Gujarat",
    },
  });
  const [saving, setSaving] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  const [logoPreview, setLogoPreview] = useState(
    company.logoPath ? `${apiBase}/company/logo?t=${Date.now()}` : null,
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef();

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.put("/company", data);
      toast.success("Company profile saved");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append("logo", file);
      await api.post("/company/logo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLogoPreview(URL.createObjectURL(file));
      toast.success("Logo uploaded");
    } catch {
      toast.error("Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const STATES = [
    "Andhra Pradesh",
    "Karnataka",
    "Kerala",
    "Maharashtra",
    "Tamil Nadu",
    "Telangana",
    "West Bengal",
    "Gujarat",
    "Madhya Pradesh",
    "Rajasthan",
    "Punjab",
    "Haryana",
    "Delhi",
    "Odisha",
    "Assam",
    "Jharkhand",
    "Chhattisgarh",
    "Bihar",
    "Uttarakhand",
    "Himachal Pradesh",
    "Goa",
  ].sort();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <div className="w-20 h-20 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Company Logo"
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <Building2 size={32} className="text-gray-300" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Company Logo</p>
          <p className="text-xs text-gray-400 mt-0.5">
            PNG or JPG, max 2MB. Appears on payslip PDFs.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingLogo}
            className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-700 border border-primary/30 bg-amber-600/5 px-3 py-1.5 rounded-lg hover:bg-amber-600/10 transition disabled:opacity-50"
          >
            <Upload size={13} />
            {uploadingLogo ? "Uploading..." : "Upload Logo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>
      </div>

      {/* Core fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Field label="Company Name *" error={errors.name?.message}>
            <input
              {...register("name", { required: "Company name is required" })}
              className={`input-base ${errors.name ? "input-error" : ""}`}
              placeholder="ManPower Solutions Pvt Ltd"
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field
            label="Registered Address *"
            error={errors.registeredAddress?.message}
          >
            <textarea
              {...register("registeredAddress", {
                required: "Address is required",
              })}
              className={`input-base resize-none ${errors.registeredAddress ? "input-error" : ""}`}
              rows={3}
              placeholder="123, Industrial Area, Vadodara, Gujarat — 390010"
            />
          </Field>
        </div>

        <Field label="GSTIN" error={errors.gstin?.message}>
          <input
            {...register("gstin", {
              pattern: {
                value:
                  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                message: "Enter a valid 15-digit GSTIN",
              },
            })}
            className={`input-base font-mono ${errors.gstin ? "input-error" : ""}`}
            placeholder="24AAAAA0000A1Z5"
            maxLength={15}
          />
        </Field>

        <Field label="PAN" error={errors.pan?.message}>
          <input
            {...register("pan", {
              pattern: {
                value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                message: "Enter a valid 10-char PAN",
              },
            })}
            className={`input-base font-mono ${errors.pan ? "input-error" : ""}`}
            placeholder="AAAAA0000A"
            maxLength={10}
          />
        </Field>

        <Field
          label="EPF Establishment Code"
          hint="Used in EPF ECR statutory filing"
        >
          <input
            {...register("epfCode")}
            className="input-base font-mono"
            placeholder="GJ/GJD/000000/000"
          />
        </Field>

        <Field
          label="ESIC Employer Code"
          hint="Used in ESIC contribution statement"
        >
          <input
            {...register("esicCode")}
            className="input-base font-mono"
            placeholder="31-00-000000-000-0000"
          />
        </Field>

        <Field
          label="PT State"
          hint="Determines which PT slab is applied during payroll"
        >
          <select {...register("ptState")} className="input-base">
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Save Profile
        </button>
      </div>
    </form>
  );
}

// ─── TAB 2: Payroll Config ───────────────────────────────────────────────────

function PayrollConfigTab({ company, onSaved }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      workingDaysBase: company.workingDaysBase || 26,
      otMultiplier: company.otMultiplier || 2.0,
      financialYearStart: company.financialYearStart || 4,
      payrollCycleDay: company.payrollCycleDay || 1,
    },
  });
  const [saving, setSaving] = useState(false);

  const otMultiplier = watch("otMultiplier");
  const workingDaysBase = watch("workingDaysBase");

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.put("/company", {
        ...company,
        workingDaysBase: Number(data.workingDaysBase),
        otMultiplier: Number(data.otMultiplier),
        financialYearStart: Number(data.financialYearStart),
        payrollCycleDay: Number(data.payrollCycleDay),
      });
      toast.success("Payroll config saved");
      onSaved();
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const MONTHS = [
    { v: 4, label: "April (Indian FY — recommended)" },
    { v: 1, label: "January (Calendar Year)" },
    { v: 7, label: "July" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Working Days */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-1">
          Working Days Base
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Used to calculate per-day salary for pro-rata and LWP deductions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              value: 26,
              title: "Fixed 26 Days",
              desc: "Industry standard for labour-intensive sectors. Sundays already excluded.",
            },
            {
              value: 0,
              title: "Calendar Days",
              desc: "Varies by month (28–31 days minus Sundays and holidays). More accurate for salaried staff.",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                Number(workingDaysBase) === opt.value
                  ? "border-primary bg-amber-600/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                {...register("workingDaysBase")}
                className="hidden"
              />
              <div className="flex items-start gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                    Number(workingDaysBase) === opt.value
                      ? "border-primary"
                      : "border-gray-300"
                  }`}
                >
                  {Number(workingDaysBase) === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {opt.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* OT Multiplier */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-1">
          Overtime Multiplier
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          OT Rate = (Basic ÷ 26 ÷ 8) × multiplier. Legal minimum is 2× per
          Factories Act.
        </p>
        <div className="flex items-center gap-4">
          <div className="w-40">
            <Field label="Multiplier" error={errors.otMultiplier?.message}>
              <input
                type="number"
                step="0.5"
                min="1"
                max="5"
                {...register("otMultiplier", {
                  required: "Required",
                  min: { value: 1, message: "Minimum 1×" },
                  max: { value: 5, message: "Maximum 5×" },
                })}
                className={`input-base ${errors.otMultiplier ? "input-error" : ""}`}
              />
            </Field>
          </div>
          <div className="flex gap-2 mt-5">
            {[1.5, 2, 2.5, 3].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  // manually set value via form
                }}
                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                  Number(otMultiplier) === v
                    ? "bg-amber-600 text-white border-primary"
                    : "border-gray-200 text-gray-600 hover:border-primary/40"
                }`}
              >
                {v}×
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
          <AlertCircle size={12} />
          Factories Act 1948 mandates minimum 2× for overtime. Consult your
          labour law advisor.
        </p>
      </section>

      {/* Financial Year & Payroll Cycle */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 mb-4">
          Financial Year & Payroll Cycle
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Financial Year Start Month"
            hint="TDS and Form 16 calculations use this"
          >
            <select {...register("financialYearStart")} className="input-base">
              {MONTHS.map((m) => (
                <option key={m.v} value={m.v}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Payroll Processing Day"
            hint="Day of month when payroll is typically run"
            error={errors.payrollCycleDay?.message}
          >
            <input
              type="number"
              min="1"
              max="28"
              {...register("payrollCycleDay", {
                required: "Required",
                min: { value: 1, message: "Min 1" },
                max: { value: 28, message: "Max 28" },
              })}
              className={`input-base ${errors.payrollCycleDay ? "input-error" : ""}`}
              placeholder="1"
            />
          </Field>
        </div>
      </section>

      {/* Summary preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">
          Current Configuration Summary
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            {
              label: "Working Days",
              value: Number(workingDaysBase) === 26 ? "26 Fixed" : "Calendar",
            },
            { label: "OT Rate", value: `${otMultiplier}×` },
            {
              label: "FY Starts",
              value: [
                "",
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ][watch("financialYearStart")],
            },
            {
              label: "Payroll Day",
              value: `${watch("payrollCycleDay")}${watch("payrollCycleDay") == 1 ? "st" : watch("payrollCycleDay") == 2 ? "nd" : watch("payrollCycleDay") == 3 ? "rd" : "th"}`,
            },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-3">
              <p className="text-lg font-black text-amber-700">{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Save Config
        </button>
      </div>
    </form>
  );
}

// ─── TAB 3: Holidays ────────────────────────────────────────────────────────

function HolidaysTab({ company, onSaved }) {
  const [holidays, setHolidays] = useState(
    (company.holidays || []).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    ),
  );
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", date: "" });
  const [deleting, setDeleting] = useState(null);

  const addHoliday = async () => {
    if (!form.name.trim() || !form.date) {
      toast.error("Holiday name and date are required");
      return;
    }
    // Check duplicate date
    if (holidays.some((h) => h.date?.split("T")[0] === form.date)) {
      toast.error("A holiday already exists on this date");
      return;
    }
    setAdding(true);
    try {
      const res = await api.post("/company/holidays", form);
      setHolidays((prev) =>
        [...prev, res.data.data].sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        ),
      );
      setForm({ name: "", date: "" });
      toast.success("Holiday added");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add holiday");
    } finally {
      setAdding(false);
    }
  };

  const deleteHoliday = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/company/holidays/${id}`);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      toast.success("Holiday removed");
      onSaved();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  // Group holidays by month for display
  const byMonth = holidays.reduce((acc, h) => {
    const d = new Date(h.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
    if (!acc[key]) acc[key] = { label, items: [] };
    acc[key].items.push(h);
    return acc;
  }, {});

  const COMMON_HOLIDAYS = [
    { name: "Republic Day", date: `${new Date().getFullYear()}-01-26` },
    { name: "Holi", date: `${new Date().getFullYear()}-03-14` },
    { name: "Good Friday", date: `${new Date().getFullYear()}-04-18` },
    { name: "Independence Day", date: `${new Date().getFullYear()}-08-15` },
    { name: "Gandhi Jayanti", date: `${new Date().getFullYear()}-10-02` },
    { name: "Diwali", date: `${new Date().getFullYear()}-10-20` },
    { name: "Christmas", date: `${new Date().getFullYear()}-12-25` },
  ].filter(
    (h) =>
      !holidays.some((existing) => existing.date?.split("T")[0] === h.date),
  );

  return (
    <div className="space-y-6">
      {/* Add holiday */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Add Holiday</h3>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1">
            <Field label="Holiday Name">
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="input-base"
                placeholder="e.g. Diwali, Republic Day"
              />
            </Field>
          </div>
          <div className="w-full sm:w-44">
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="input-base"
              />
            </Field>
          </div>
          <div className="flex items-end">
            <button
              onClick={addHoliday}
              disabled={adding}
              className="btn-primary w-full sm:w-auto"
            >
              {adding ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus size={15} />
              )}
              Add
            </button>
          </div>
        </div>

        {/* Quick add common holidays */}
        {COMMON_HOLIDAYS.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-semibold">
              Quick add:
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_HOLIDAYS.map((h) => (
                <button
                  key={h.name}
                  onClick={() => setForm({ name: h.name, date: h.date })}
                  className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-600 hover:border-primary hover:text-amber-700 transition"
                >
                  + {h.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Holiday list */}
      {holidays.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
          <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No holidays added yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add national and company-specific holidays above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              {holidays.length} Holiday{holidays.length > 1 ? "s" : ""}{" "}
              Configured
            </h3>
          </div>
          {Object.entries(byMonth).map(([key, { label, items }]) => (
            <div
              key={key}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {label}
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-black text-amber-700 leading-none">
                          {new Date(h.date).getDate()}
                        </span>
                        <span className="text-[9px] text-amber-500 font-semibold uppercase">
                          {new Date(h.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                          })}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {h.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(h.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHoliday(h.id)}
                      disabled={deleting === h.id}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      {deleting === h.id ? (
                        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB 4: PT Slabs ────────────────────────────────────────────────────────

function PTSlabsTab({ company }) {
  const [slabs, setSlabs] = useState(
    (company.ptSlabs || [])
      .filter((s) => s.state === (company.ptState || "Gujarat"))
      .sort((a, b) => a.minSalary - b.minSalary)
      .map((s) => ({ ...s, _id: s.id })),
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const addRow = () => {
    const last = slabs[slabs.length - 1];
    setSlabs((prev) => [
      ...prev,
      {
        _id: `new_${Date.now()}`,
        minSalary: last ? (last.maxSalary || 0) + 1 : 0,
        maxSalary: "",
        ptAmount: 0,
        frequency: "monthly",
      },
    ]);
    setDirty(true);
  };

  const updateRow = (idx, field, value) => {
    setSlabs((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
    setDirty(true);
  };

  const removeRow = (idx) => {
    setSlabs((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const save = async () => {
    // Validate
    for (const s of slabs) {
      if (s.minSalary === "" || s.minSalary === null) {
        toast.error("All slabs must have a minimum salary");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = slabs.map((s) => ({
        minSalary: Number(s.minSalary),
        maxSalary:
          s.maxSalary !== "" && s.maxSalary !== null
            ? Number(s.maxSalary)
            : null,
        ptAmount: Number(s.ptAmount),
        frequency: s.frequency || "monthly",
      }));
      await api.put("/company/pt-slabs", {
        state: company.ptState || "Gujarat",
        slabs: payload,
      });
      toast.success("PT slabs saved");
      setDirty(false);
    } catch (err) {
      toast.error("Failed to save PT slabs");
    } finally {
      setSaving(false);
    }
  };

  const stateDefaults = {
    Gujarat: [
      { minSalary: 0, maxSalary: 5999, ptAmount: 0, note: "No PT" },
      { minSalary: 6000, maxSalary: 8999, ptAmount: 80, note: "₹80/month" },
      { minSalary: 9000, maxSalary: 11999, ptAmount: 150, note: "₹150/month" },
      {
        minSalary: 12000,
        maxSalary: null,
        ptAmount: 200,
        note: "₹200/month (max)",
      },
    ],
    Karnataka: [
      { minSalary: 0, maxSalary: 14999, ptAmount: 0, note: "No PT" },
      { minSalary: 15000, maxSalary: 29999, ptAmount: 150, note: "₹150/month" },
      { minSalary: 30000, maxSalary: null, ptAmount: 200, note: "₹200/month" },
    ],
    Maharashtra: [
      { minSalary: 0, maxSalary: 7499, ptAmount: 0, note: "No PT" },
      { minSalary: 7500, maxSalary: 9999, ptAmount: 175, note: "₹175/month" },
      { minSalary: 10000, maxSalary: null, ptAmount: 200, note: "₹200/month" },
    ],
  };

  const loadDefault = () => {
    const def = stateDefaults[company.ptState];
    if (!def) {
      toast.error(`No preset for ${company.ptState}. Add slabs manually.`);
      return;
    }
    setSlabs(
      def.map((s, i) => ({ ...s, _id: `preset_${i}`, frequency: "monthly" })),
    );
    setDirty(true);
    toast.success(`Loaded ${company.ptState} PT defaults`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            Professional Tax Slabs — {company.ptState || "Gujarat"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            PT is deducted monthly based on gross salary. Max ₹2,500/year per
            employee. Change the active state in Company Profile → PT State.
          </p>
        </div>
        <button
          onClick={loadDefault}
          className="text-xs font-semibold text-amber-700 border border-primary/30 bg-amber-600/5 px-3 py-2 rounded-lg hover:bg-amber-600/10 transition flex-shrink-0"
        >
          Load {company.ptState} Defaults
        </button>
      </div>

      {/* Slab table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Min Salary (₹)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Max Salary (₹)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  PT Amount (₹)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Frequency
                </th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {slabs.map((s, i) => (
                <tr key={s._id} className="group hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={s.minSalary}
                      onChange={(e) =>
                        updateRow(i, "minSalary", e.target.value)
                      }
                      className="input-base py-2 text-sm w-full"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={s.maxSalary ?? ""}
                      onChange={(e) =>
                        updateRow(i, "maxSalary", e.target.value || null)
                      }
                      className="input-base py-2 text-sm w-full"
                      placeholder="No limit (leave blank)"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={s.ptAmount}
                      onChange={(e) => updateRow(i, "ptAmount", e.target.value)}
                      className="input-base py-2 text-sm w-full"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={s.frequency}
                      onChange={(e) =>
                        updateRow(i, "frequency", e.target.value)
                      }
                      className="input-base py-2 text-sm"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeRow(i)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {slabs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400 text-sm"
                  >
                    No PT slabs configured. Click "Load Defaults" or add a row.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={addRow}
            className="text-sm text-amber-700 font-semibold flex items-center gap-1.5 hover:underline"
          >
            <Plus size={15} /> Add Slab
          </button>
          {dirty && (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> Unsaved changes
            </span>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        <strong>Note:</strong> Ensure slabs are contiguous (no gaps) and the
        last slab has no Max (leave blank = no upper limit). PT is capped at
        ₹2,500/year by law.
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="btn-primary disabled:opacity-40"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Save PT Slabs
        </button>
      </div>
    </div>
  );
}

// ─── TAB 5: Structure (Sites + Departments) ──────────────────────────────────

function StructureTab({ company, onSaved }) {
  const [sites, setSites] = useState(company.sites || []);
  const [departments, setDepartments] = useState(company.departments || []);
  const [siteForm, setSiteForm] = useState({ name: "", address: "" });
  const [deptForm, setDeptForm] = useState({ name: "" });
  const [addingSite, setAddingSite] = useState(false);
  const [addingDept, setAddingDept] = useState(false);

  const addSite = async () => {
    if (!siteForm.name.trim()) {
      toast.error("Site name is required");
      return;
    }
    if (
      sites.some((s) => s.name.toLowerCase() === siteForm.name.toLowerCase())
    ) {
      toast.error("A site with this name already exists");
      return;
    }
    setAddingSite(true);
    try {
      const res = await api.post("/company/sites", siteForm);
      setSites((prev) => [...prev, res.data.data]);
      setSiteForm({ name: "", address: "" });
      toast.success("Site added");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add site");
    } finally {
      setAddingSite(false);
    }
  };

  const addDepartment = async () => {
    if (!deptForm.name.trim()) {
      toast.error("Department name is required");
      return;
    }
    if (
      departments.some(
        (d) => d.name.toLowerCase() === deptForm.name.toLowerCase(),
      )
    ) {
      toast.error("A department with this name already exists");
      return;
    }
    setAddingDept(true);
    try {
      const res = await api.post("/company/departments", deptForm);
      setDepartments((prev) => [...prev, res.data.data]);
      setDeptForm({ name: "" });
      toast.success("Department added");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add department");
    } finally {
      setAddingDept(false);
    }
  };

  const deleteSite = async (id) => {
    try {
      await api.delete(`/company/sites/${id}`);
      setSites((prev) => prev.filter((s) => s.id !== id));
      toast.success("Site removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete site");
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/company/departments/${id}`);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Department removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete department");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sites */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Sites / Locations</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Client sites where employees are deployed. Used to group employees
            and generate site-wise reports.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <Field label="Site Name">
            <input
              value={siteForm.name}
              onChange={(e) =>
                setSiteForm((p) => ({ ...p, name: e.target.value }))
              }
              className="input-base"
              placeholder="e.g. Head Office, Factory Unit 1"
              onKeyDown={(e) => e.key === "Enter" && addSite()}
            />
          </Field>
          <Field label="Address (optional)">
            <input
              value={siteForm.address}
              onChange={(e) =>
                setSiteForm((p) => ({ ...p, address: e.target.value }))
              }
              className="input-base"
              placeholder="e.g. Plot 12, GIDC, Vadodara"
            />
          </Field>
          <button
            onClick={addSite}
            disabled={addingSite}
            className="btn-primary w-full justify-center"
          >
            {addingSite ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            Add Site
          </button>
        </div>

        <div className="space-y-2">
          {sites.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              <MapPin size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No sites added yet</p>
            </div>
          ) : (
            sites.map((site) => (
              <div
                key={site.id}
                className="flex items-start gap-3 p-3.5 bg-white border border-gray-100 rounded-xl group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {site.name}
                  </p>
                  {site.address && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {site.address}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteSite(site.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Departments */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Departments</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Internal divisions for organising employees. Used for payroll
            summary breakdowns.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <Field label="Department Name">
            <input
              value={deptForm.name}
              onChange={(e) => setDeptForm({ name: e.target.value })}
              className="input-base"
              placeholder="e.g. General, Security, Housekeeping"
              onKeyDown={(e) => e.key === "Enter" && addDepartment()}
            />
          </Field>
          <button
            onClick={addDepartment}
            disabled={addingDept}
            className="btn-primary w-full justify-center"
          >
            {addingDept ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            Add Department
          </button>
        </div>

        <div className="space-y-2">
          {departments.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              <Layers size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No departments added yet</p>
            </div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Layers size={14} className="text-purple-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800 flex-1">
                  {dept.name}
                </p>
                <button
                  onClick={() => deleteDepartment(dept.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TAB 6: Statutory Rules ──────────────────────────────────────────────────
//
// Edits Company.statutoryConfig via GET/PUT /api/company/statutory-config.
// The form is seeded from the *effective* config (India defaults + overrides)
// and, on save, sends only the fields that differ from the India defaults — so
// the persisted override stays minimal and "reset" cleanly returns to defaults.

const STAT_SCHEMES = [
  {
    key: "epf",
    title: "Provident Fund (EPF)",
    desc: "Retirement contribution deducted from and matched on PF wages.",
    toggle: true,
    fields: [
      { k: "label", type: "text", label: "Employee line-item label" },
      { k: "employerLabel", type: "text", label: "Employer line-item label" },
      { k: "base", type: "base", label: "Contribution base" },
      { k: "employeeRate", type: "rate", label: "Employee rate (%)" },
      { k: "employerRate", type: "rate", label: "Employer rate (%)" },
      {
        k: "wageCeiling",
        type: "amountOrNull",
        label: "Wage ceiling (₹)",
        capLabel: "Cap the contribution base",
      },
    ],
  },
  {
    key: "esic",
    title: "State Insurance (ESIC)",
    desc: "Applies only while monthly gross stays within the eligibility ceiling.",
    toggle: true,
    fields: [
      { k: "label", type: "text", label: "Employee line-item label" },
      { k: "employerLabel", type: "text", label: "Employer line-item label" },
      { k: "base", type: "base", label: "Contribution base" },
      { k: "employeeRate", type: "rate", label: "Employee rate (%)" },
      { k: "employerRate", type: "rate", label: "Employer rate (%)" },
      {
        k: "grossThreshold",
        type: "amountOrNull",
        label: "Gross eligibility ceiling (₹)",
        capLabel: "Apply only up to a gross ceiling",
      },
    ],
  },
  {
    key: "professionalTax",
    title: "Professional Tax",
    desc: "Slab-driven — the amounts are configured in the PT Slabs tab; this only toggles/labels the deduction.",
    toggle: true,
    fields: [{ k: "label", type: "text", label: "Line-item label" }],
  },
  {
    key: "tds",
    title: "TDS / Income Tax",
    desc: "Projected annual tax spread across the remaining months of the financial year.",
    toggle: true,
    fields: [{ k: "label", type: "text", label: "Line-item label" }],
  },
  {
    key: "overtime",
    title: "Overtime",
    desc: "Hourly OT rate = base ÷ divisor days ÷ hours-per-day × OT multiplier (set in Payroll Config).",
    toggle: false,
    fields: [
      { k: "label", type: "text", label: "Line-item label" },
      { k: "divisorDays", type: "positiveNumber", label: "Divisor days" },
      { k: "hoursPerDay", type: "positiveNumber", label: "Hours per day" },
    ],
  },
];

const roundTo = (n, d) => Number(Number(n).toFixed(d));
const eqVal = (a, b) => {
  if (a == null || b == null) return a === b;
  if (typeof a === "number" && typeof b === "number")
    return Math.abs(a - b) < 1e-9;
  return a === b;
};

function initStatForm(effective) {
  const f = {};
  for (const s of STAT_SCHEMES) {
    const src = effective[s.key] || {};
    const o = {};
    if (s.toggle) o.enabled = src.enabled !== false;
    for (const fld of s.fields) {
      const raw = src[fld.k];
      if (fld.type === "rate") o[fld.k] = raw == null ? "" : roundTo(raw * 100, 4);
      else if (fld.type === "amountOrNull") o[fld.k] = raw == null ? null : raw;
      else o[fld.k] = raw ?? "";
    }
    f[s.key] = o;
  }
  return f;
}

function toCanonical(type, val) {
  if (type === "rate") return val === "" ? 0 : roundTo(Number(val) / 100, 6);
  if (type === "amountOrNull")
    return val === null || val === "" ? null : Number(val);
  if (type === "positiveNumber") return Number(val);
  return val;
}

// Diff the form against the India defaults → minimal override payload.
function buildOverrides(form, defaults) {
  const out = {};
  for (const s of STAT_SCHEMES) {
    const clean = {};
    const def = defaults[s.key] || {};
    if (s.toggle && form[s.key].enabled !== (def.enabled ?? true)) {
      clean.enabled = form[s.key].enabled;
    }
    for (const fld of s.fields) {
      const cur = toCanonical(fld.type, form[s.key][fld.k]);
      if (!eqVal(cur, def[fld.k])) clean[fld.k] = cur;
    }
    if (Object.keys(clean).length) out[s.key] = clean;
  }
  return out;
}

function StatToggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-amber-600" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={on}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function StatutoryConfigTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaults, setDefaults] = useState(null);
  const [isCustom, setIsCustom] = useState(false);
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/company/statutory-config");
      const { effective, defaults: def, isCustom: custom } = res.data.data;
      setDefaults(def);
      setIsCustom(custom);
      setForm(initStatForm(effective));
      setDirty(false);
    } catch {
      toast.error("Failed to load statutory rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (scheme, field, value) => {
    setForm((p) => ({ ...p, [scheme]: { ...p[scheme], [field]: value } }));
    setDirty(true);
  };

  const save = async () => {
    const overrides = buildOverrides(form, defaults);
    setSaving(true);
    try {
      const res = await api.put("/company/statutory-config", {
        statutoryConfig: Object.keys(overrides).length ? overrides : {},
      });
      setIsCustom(res.data.data.isCustom);
      toast.success(
        res.data.data.isCustom
          ? "Statutory rules saved"
          : "Rules match India defaults — no override stored",
      );
      setDirty(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save statutory rules");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setSaving(true);
    try {
      const res = await api.put("/company/statutory-config", {
        statutoryConfig: {},
      });
      setDefaults((d) => d); // unchanged
      setIsCustom(false);
      // Re-seed the form straight from the India defaults.
      const seeded = {};
      for (const s of STAT_SCHEMES) seeded[s.key] = defaults[s.key];
      setForm(initStatForm(seeded));
      setDirty(false);
      toast.success("Reset to India defaults");
    } catch {
      toast.error("Failed to reset");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / status */}
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            Statutory Rules (Jurisdiction)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
            Contribution rates, wage ceilings, eligibility thresholds and payslip
            labels used by the payroll engine. Defaults follow Indian law (EPF /
            ESIC / PT / TDS). Override only what differs for this company.
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 ${
            isCustom
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {isCustom ? "Custom rules" : "India defaults"}
        </span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2.5 text-xs text-blue-800">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <p>
          A scheme applies to an employee only when it is enabled here{" "}
          <strong>and</strong> the employee/template opts in. Turning a scheme{" "}
          <strong>off</strong> removes it entirely — useful for non-India
          tenants. Existing payslips are never changed retroactively.
        </p>
      </div>

      {/* Scheme cards */}
      {STAT_SCHEMES.map((s) => {
        const state = form[s.key];
        const disabled = s.toggle && !state.enabled;
        return (
          <div
            key={s.key}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800">{s.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 max-w-xl">{s.desc}</p>
              </div>
              {s.toggle && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      state.enabled ? "text-amber-700" : "text-gray-400"
                    }`}
                  >
                    {state.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <StatToggle
                    on={state.enabled}
                    onChange={(v) => set(s.key, "enabled", v)}
                  />
                </div>
              )}
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 ${
                disabled ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {s.fields.map((fld) => {
                if (fld.type === "base") {
                  return (
                    <Field key={fld.k} label={fld.label}>
                      <select
                        value={state[fld.k]}
                        onChange={(e) => set(s.key, fld.k, e.target.value)}
                        className="input-base"
                      >
                        <option value="basic">Basic</option>
                        <option value="gross">Gross</option>
                      </select>
                    </Field>
                  );
                }
                if (fld.type === "amountOrNull") {
                  const capped = state[fld.k] !== null;
                  return (
                    <Field key={fld.k} label={fld.label}>
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={capped}
                          onChange={(e) =>
                            set(
                              s.key,
                              fld.k,
                              e.target.checked
                                ? (defaults[s.key]?.[fld.k] ?? 0)
                                : null,
                            )
                          }
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs text-gray-600">
                          {fld.capLabel}
                        </span>
                      </label>
                      {capped ? (
                        <input
                          type="number"
                          min="0"
                          value={state[fld.k] ?? ""}
                          onChange={(e) =>
                            set(
                              s.key,
                              fld.k,
                              e.target.value === "" ? "" : Number(e.target.value),
                            )
                          }
                          className="input-base"
                        />
                      ) : (
                        <p className="text-xs text-gray-400 italic py-2">
                          Uncapped
                        </p>
                      )}
                    </Field>
                  );
                }
                // text / rate / positiveNumber
                const isNum = fld.type === "rate" || fld.type === "positiveNumber";
                return (
                  <Field key={fld.k} label={fld.label}>
                    <input
                      type={isNum ? "number" : "text"}
                      step={fld.type === "rate" ? "0.01" : "1"}
                      min={isNum ? "0" : undefined}
                      value={state[fld.k]}
                      onChange={(e) => set(s.key, fld.k, e.target.value)}
                      className="input-base"
                    />
                  </Field>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={resetToDefaults}
          disabled={saving || !isCustom}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-40"
        >
          <RotateCcw size={13} /> Reset to India defaults
        </button>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> Unsaved changes
            </span>
          )}
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="btn-primary disabled:opacity-40"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile", label: "Company Profile", icon: Building2 },
  { id: "payroll", label: "Payroll Config", icon: IndianRupee },
  { id: "statutory", label: "Statutory Rules", icon: Landmark },
  { id: "holidays", label: "Holidays", icon: Calendar },
  { id: "pt", label: "PT Slabs", icon: IndianRupee },
  { id: "structure", label: "Structure", icon: Layers },
];

export default function CompanySettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await api.get("/company");
      setCompany(res.data.data);
    } catch {
      toast.error("Failed to load company settings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 font-semibold">Company not configured</p>
        <p className="text-sm text-gray-400 mt-1">
          Run the seed script to initialise default data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tab bar — scrollable on mobile */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold
              transition-all whitespace-nowrap flex-shrink-0
              ${
                activeTab === tab.id
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            <tab.icon size={14} className="flex-shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 sm:p-6 animate-fade-in">
        {activeTab === "profile" && (
          <CompanyProfileTab company={company} onSaved={fetchCompany} />
        )}
        {activeTab === "payroll" && (
          <PayrollConfigTab company={company} onSaved={fetchCompany} />
        )}
        {activeTab === "statutory" && <StatutoryConfigTab />}
        {activeTab === "holidays" && (
          <HolidaysTab company={company} onSaved={fetchCompany} />
        )}
        {activeTab === "pt" && <PTSlabsTab company={company} />}
        {activeTab === "structure" && (
          <StructureTab company={company} onSaved={fetchCompany} />
        )}
      </div>
    </div>
  );
}
