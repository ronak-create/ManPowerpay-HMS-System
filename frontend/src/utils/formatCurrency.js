export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount || 0);
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-IN').format(n || 0);
}

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function monthLabel(m, y) {
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export const ATTENDANCE_COLORS = {
  P: { bg: 'bg-green-100', text: 'text-green-700', dot: '#16a34a', label: 'Present' },
  A: { bg: 'bg-red-100', text: 'text-red-700', dot: '#dc2626', label: 'Absent' },
  H: { bg: 'bg-amber-100', text: 'text-amber-700', dot: '#d97706', label: 'Half Day' },
  PL: { bg: 'bg-blue-100', text: 'text-blue-700', dot: '#2563eb', label: 'Paid Leave' },
  WO: { bg: 'bg-gray-100', text: 'text-gray-500', dot: '#9ca3af', label: 'Week Off' },
  HO: { bg: 'bg-purple-100', text: 'text-purple-700', dot: '#7c3aed', label: 'Holiday' },
  LWP: { bg: 'bg-red-50', text: 'text-red-500', dot: '#f87171', label: 'LWP' },
};
