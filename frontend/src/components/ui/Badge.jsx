import clsx from 'clsx';

const variants = {
  green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70',
  red:    'bg-red-50 text-red-700 ring-1 ring-red-200/70',
  amber:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200/70',
  blue:   'bg-sky-50 text-sky-700 ring-1 ring-sky-200/70',
  gray:   'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/70',
  purple: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/70',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70',
};

const dots = {
  green: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500',
  blue: 'bg-sky-500', gray: 'bg-zinc-400', purple: 'bg-violet-500', indigo: 'bg-indigo-500',
};

export default function Badge({ children, variant = 'gray', dot = false, className = '' }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide',
      variants[variant] || variants.gray, className
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dots[variant] || dots.gray)} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    active:    { label: 'Active',      variant: 'green',  dot: true },
    inactive:  { label: 'Inactive',    variant: 'red',    dot: true },
    pending:   { label: 'Pending',     variant: 'amber',  dot: true },
    approved:  { label: 'Approved',    variant: 'green',  dot: true },
    rejected:  { label: 'Rejected',    variant: 'red',    dot: true },
    cancelled: { label: 'Cancelled',   variant: 'gray',   dot: true },
    draft:     { label: 'Draft',       variant: 'amber',  dot: true },
    locked:    { label: 'Locked',      variant: 'green',  dot: true },
    P:         { label: 'Present',     variant: 'green' },
    A:         { label: 'Absent',      variant: 'red' },
    H:         { label: 'Half Day',    variant: 'amber' },
    PL:        { label: 'Paid Leave',  variant: 'blue' },
    WO:        { label: 'Week Off',    variant: 'gray' },
    HO:        { label: 'Holiday',     variant: 'purple' },
    LWP:       { label: 'LWP',         variant: 'red' },
  };
  const cfg = map[status] || { label: status, variant: 'gray' };
  return <Badge variant={cfg.variant} dot={cfg.dot}>{cfg.label}</Badge>;
}
