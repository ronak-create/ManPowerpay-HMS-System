import clsx from 'clsx';

export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div className={clsx(
      'bg-white rounded-2xl border border-gray-100 shadow-card',
      padding && 'p-5',
      hover && 'hover:shadow-card-hover transition-shadow duration-200 cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, border = true }) {
  return (
    <div className={clsx('flex items-start justify-between mb-5', border && 'pb-4 border-b border-gray-50')}>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// Gradient stat card
export function StatCard({ label, value, sub, icon, gradient = 'from-primary-800 to-primary-light', iconBg }) {
  return (
    <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-card`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg || 'bg-white/20'} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black tracking-tight">{value ?? '—'}</div>
      <div className="text-white/80 text-sm font-medium mt-0.5">{label}</div>
      {sub && <div className="text-white/60 text-xs mt-1">{sub}</div>}
    </div>
  );
}
