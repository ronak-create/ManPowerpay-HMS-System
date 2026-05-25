import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Lock,
  Building,
  CreditCard,
  Save,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import useAuthStore from "../../store/authStore";
import { format } from "date-fns";

export default function MyProfile() {
  const { user } = useAuthStore();
  const emp = user?.employee; // reactive — updates when AppInit resolves /auth/me
  const [tab, setTab] = useState("info");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const emp = user?.employee;
  const { authReady } = useAuthStore();

  if (!authReady) {
    return (
      <div className="...">
        <Loader className="animate-spin" /> Loading profile…
      </div>
    );
  }
  if (!emp) {
    return (
      <div className="...">
        Employee record not found. Please contact your administrator.
      </div>
    );
  }LeaveApplication

  // BUG FIX: employee data arrives asynchronously via AppInit → /auth/me.
  // Show a skeleton while it loads rather than silently rendering all fields as "—".
  if (!emp) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="page-header">My Profile</h1>
          <p className="page-subtitle">Your account information and settings</p>
        </div>
        <div className="card flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader size={20} className="animate-spin" />
          <span className="text-sm font-medium">Loading profile…</span>
        </div>
      </div>
    );
  }

  const changePassword = async (data) => {
    if (data.newPassword !== data.confirm)
      return toast.error("Passwords do not match");
    try {
      await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  const tabs = [
    { id: "info", label: "Personal Info", icon: User },
    { id: "work", label: "Work Details", icon: Building },
    { id: "bank", label: "Bank Info", icon: CreditCard },
    { id: "password", label: "Change Password", icon: Lock },
  ];

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-40 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800 mt-0.5 sm:mt-0">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-header">My Profile</h1>
        <p className="page-subtitle">Your account information and settings</p>
      </div>

      {/* Avatar card */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
          {user?.name?.[0]}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{user?.name}</h2>
          <p className="text-sm text-gray-500">
            {emp.designation || "Employee"} · {emp.department?.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {emp.empCode} · Joined{" "}
            {emp.dateOfJoining
              ? format(new Date(emp.dateOfJoining), "dd MMM yyyy")
              : "—"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0
              ${tab === t.id ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card animate-fade-in">
        {tab === "info" && (
          <div>
            <InfoRow label="Full Name" value={user?.name} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Mobile" value={user?.mobile} />
            <InfoRow
              label="Date of Birth"
              value={
                emp.dateOfBirth
                  ? format(new Date(emp.dateOfBirth), "dd MMM yyyy")
                  : null
              }
            />
            <InfoRow label="Gender" value={emp.gender} />
            <InfoRow label="Address" value={emp.address} />
            <InfoRow label="Emergency Contact" value={emp.emergencyContact} />
            <InfoRow label="Emergency Phone" value={emp.emergencyPhone} />
          </div>
        )}

        {tab === "work" && (
          <div>
            <InfoRow label="Employee Code" value={emp.empCode} />
            <InfoRow label="Designation" value={emp.designation} />
            <InfoRow label="Department" value={emp.department?.name} />
            <InfoRow label="Site" value={emp.site?.name} />
            <InfoRow label="Supervisor" value={emp.supervisor?.user?.name} />
            <InfoRow
              label="Date of Joining"
              value={
                emp.dateOfJoining
                  ? format(new Date(emp.dateOfJoining), "dd MMMM yyyy")
                  : null
              }
            />
            <InfoRow label="PF Account No" value={emp.pfAccountNo} />
            <InfoRow label="UAN No" value={emp.uanNo} />
            <InfoRow label="ESIC No" value={emp.esicNo} />
            <InfoRow label="PAN" value={emp.pan} />
          </div>
        )}

        {tab === "bank" && (
          <div>
            <InfoRow label="Bank Name" value={emp.bankName} />
            <InfoRow
              label="Account Number"
              value={
                emp.bankAccountNo
                  ? `XXXX XXXX ${emp.bankAccountNo.slice(-4)}`
                  : null
              }
            />
            <InfoRow label="IFSC Code" value={emp.ifscCode} />
          </div>
        )}

        {tab === "password" && (
          <form
            onSubmit={handleSubmit(changePassword)}
            className="space-y-4 max-w-md"
          >
            <h3 className="font-semibold text-gray-800 mb-4">
              Change Your Password
            </h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  {...register("currentPassword", { required: true })}
                  className="input-base pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  {...register("newPassword", {
                    required: true,
                    minLength: { value: 8, message: "Min 8 characters" },
                  })}
                  className="input-base pr-10"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                {...register("confirm", { required: true })}
                className="input-base"
                placeholder="Repeat new password"
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              <Save size={15} /> Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
