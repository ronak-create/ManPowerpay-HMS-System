import clsx from 'clsx';

const variants = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

// Pre-built status badges
export function StatusBadge({ status }) {
  const map = {
    active: { label: 'Active', variant: 'green' },
    inactive: { label: 'Inactive', variant: 'red' },
    pending: { label: 'Pending', variant: 'amber' },
    approved: { label: 'Approved', variant: 'green' },
    rejected: { label: 'Rejected', variant: 'red' },
    cancelled: { label: 'Cancelled', variant: 'gray' },
    draft: { label: 'Draft', variant: 'amber' },
    locked: { label: 'Locked', variant: 'green' },
    P: { label: 'Present', variant: 'green' },
    A: { label: 'Absent', variant: 'red' },
    H: { label: 'Half Day', variant: 'amber' },
    PL: { label: 'Paid Leave', variant: 'blue' },
    WO: { label: 'Week Off', variant: 'gray' },
    HO: { label: 'Holiday', variant: 'purple' },
    LWP: { label: 'LWP', variant: 'red' },
  };
  const { label, variant } = map[status] || { label: status, variant: 'gray' };
  return <Badge variant={variant}>{label}</Badge>;
}
