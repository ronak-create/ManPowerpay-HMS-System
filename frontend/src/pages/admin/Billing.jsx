import { useState, useEffect } from "react";
import {
  CreditCard,
  Users,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { formatINR, formatNumber } from "../../utils/formatCurrency";

// Human-friendly names for the feature flags stored on each plan.
const FEATURE_LABELS = {
  bulkExport: "Bulk payslip export",
  watermarkedPayslips: "Watermarked payslips",
};

// Render a plan's feature set as a checklist. `watermarkedPayslips` is a
// negative feature — absence of the watermark is the perk — so invert it.
function planPerks(plan) {
  const f = plan.features || {};
  const perks = [];
  perks.push({ ok: true, text: `Up to ${formatNumber(plan.employeeLimit)} employees` });
  perks.push({ ok: !!f.bulkExport, text: FEATURE_LABELS.bulkExport });
  perks.push({
    ok: !f.watermarkedPayslips,
    text: "Clean (un-watermarked) payslips",
  });
  return perks;
}

export default function Billing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/billing")
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Failed to load billing details"))
      .finally(() => setLoading(false));
  }, []);

  // Checkout is intentionally not wired yet — the Razorpay gateway is pending
  // account verification. Surface a clear message instead of a dead button.
  const handleUpgrade = () => {
    toast(
      "Online payments are being enabled. Contact support to change your plan.",
      { icon: "💳", duration: 5000 },
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 font-semibold">Could not load billing</p>
      </div>
    );
  }

  const { plan, subscription, usage, availablePlans } = data;
  const limit = usage.employeeLimit; // null = unlimited
  const used = usage.activeEmployees;
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const nearLimit = limit && used / limit >= 0.8;
  const currentCode = plan?.code || null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Current plan + usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Plan card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Current Plan
              </p>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-2xl font-black text-gray-800">
                  {plan?.name || "No plan"}
                </h2>
                {plan && (
                  <span className="text-sm font-semibold text-gray-400">
                    {plan.priceMonthly === 0
                      ? "Free"
                      : `${formatINR(plan.priceMonthly)}/mo`}
                  </span>
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
              <CreditCard size={20} className="text-amber-600" />
            </div>
          </div>

          {subscription && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    subscription.status === "active"
                      ? "bg-green-500"
                      : "bg-amber-500"
                  }`}
                />
                <span className="font-semibold text-gray-600 capitalize">
                  {subscription.status}
                </span>
              </span>
              {subscription.currentPeriodEnd && (
                <span className="text-gray-500">
                  Renews{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </span>
              )}
            </div>
          )}
          {!subscription && (
            <p className="mt-4 text-xs text-gray-400">
              No active subscription — usage is currently ungated.
            </p>
          )}
        </div>

        {/* Usage card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Employee Usage
            </p>
          </div>
          <p className="mt-3 text-3xl font-black text-gray-800">
            {formatNumber(used)}
            <span className="text-base font-semibold text-gray-400">
              {" "}
              / {limit ? formatNumber(limit) : "∞"}
            </span>
          </p>
          {limit ? (
            <>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    nearLimit ? "bg-amber-500" : "bg-amber-600"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {nearLimit && (
                <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle size={12} /> Approaching your plan limit
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-xs text-gray-400">Unlimited employees</p>
          )}
        </div>
      </div>

      {/* Available plans */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-amber-600" />
          <h3 className="text-sm font-bold text-gray-800">Available Plans</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {availablePlans.map((p) => {
            const isCurrent = p.code === currentCode;
            return (
              <div
                key={p.id || p.code}
                className={`relative rounded-2xl border-2 p-5 flex flex-col transition-all ${
                  isCurrent
                    ? "border-amber-500 bg-amber-50/40 shadow-card"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 left-5 text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
                <h4 className="text-base font-bold text-gray-800">{p.name}</h4>
                <div className="mt-1 mb-4">
                  <span className="text-2xl font-black text-gray-800">
                    {p.priceMonthly === 0
                      ? "Free"
                      : formatINR(p.priceMonthly)}
                  </span>
                  {p.priceMonthly > 0 && (
                    <span className="text-xs text-gray-400 font-semibold">
                      {" "}
                      / month
                    </span>
                  )}
                </div>

                <ul className="space-y-2 flex-1">
                  {planPerks(p).map((perk, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-xs ${
                        perk.ok ? "text-gray-700" : "text-gray-300 line-through"
                      }`}
                    >
                      <Check
                        size={13}
                        className={`flex-shrink-0 mt-0.5 ${
                          perk.ok ? "text-green-600" : "text-gray-300"
                        }`}
                      />
                      {perk.text}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleUpgrade}
                  disabled={isCurrent}
                  className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  {isCurrent ? "Current Plan" : "Choose Plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gateway-pending note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-2.5 text-xs text-blue-800">
        <ShieldCheck size={15} className="flex-shrink-0 mt-0.5" />
        <p>
          Secure online payments (Razorpay) are being enabled for your account.
          Until then, plan changes are handled by our support team — reach out
          and we'll switch you over.
        </p>
      </div>
    </div>
  );
}
