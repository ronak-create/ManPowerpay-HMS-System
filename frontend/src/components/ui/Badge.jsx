import clsx from 'clsx';

const variants = {
  green:  'bg-green-50 text-green-700 ring-1 ring-green-200/60',
  red:    'bg-red-50 text-red-700 ring-1 ring-red-200/60',
  amber:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  blue:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
  gray:   'bg-gray-100 text-gray-600 ring-1 ring-gray-200/60',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/60',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60',
};

const dots = { green: 'bg-green-500', red: 'bg-red-500', amber: 'bg-amber-500', blue: 'bg-blue-500', gray: 'bg-gray-400', purple: 'bg-purple-500', indigo: 'bg-indigo-500' };

export default function Badge({ children, variant = 'gray', dot = false, className = '' }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', variants[variant], className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dots[variant])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    active:   { label: 'Active',      variant: 'green',  dot: true },
    inactive: { label: 'Inactive',    variant: 'red',    dot: true },
    pending:  { label: 'Pending',     variant: 'amber',  dot: true },
    approved: { label: 'Approved',    variant: 'green',  dot: true },
    rejected: { label: 'Rejected',    variant: 'red',    dot: true },
    cancelled:{ label: 'Cancelled',   variant: 'gray',   dot: true },
    draft:    { label: 'Draft',       variant: 'amber',  dot: true },
    locked:   { label: 'Locked',      variant: 'green',  dot: true },
    P:        { label: 'Present',     variant: 'green' },
    A:        { label: 'Absent',      variant: 'red' },
    H:        { label: 'Half Day',    variant: 'amber' },
    PL:       { label: 'Paid Leave',  variant: 'blue' },
    WO:       { label: 'Week Off',    variant: 'gray' },
    HO:       { label: 'Holiday',     variant: 'purple' },
    LWP:      { label: 'LWP',         variant: 'red' },
  };
  const cfg = map[status] || { label: status, variant: 'gray' };
  return <Badge variant={cfg.variant} dot={cfg.dot}>{cfg.label}</Badge>;
}
