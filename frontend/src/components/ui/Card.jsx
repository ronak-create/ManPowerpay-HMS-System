import clsx from 'clsx';

export default function Card({ children, title, subtitle, action, className = '', padding = true, hover = false }) {
  return (
    <div className={clsx(
      'bg-white rounded-2xl border border-zinc-100 shadow-card',
      padding && 'p-5',
      hover && 'card-hover cursor-pointer',
      className
    )}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-5 pb-4 border-b border-zinc-50">
          <div>
            <h3 className="font-semibold text-zinc-900 text-sm">{title}</h3>
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5 font-normal">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, border = true }) {
  return (
    <div className={clsx('flex items-start justify-between mb-5', border && 'pb-4 border-b border-zinc-50')}>
      <div>
        <h3 className="font-semibold text-zinc-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5 font-normal">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, gradient, iconBg }) {
  const bg = gradient || 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)';
  return (
    <div className="relative rounded-2xl p-5 text-white overflow-hidden"
         style={{ background: bg, boxShadow: '0 4px 14px 0 rgba(217,119,6,.3)' }}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.08) 50%, transparent 100%)',
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s infinite',
           }} />
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3',
           iconBg || 'bg-black/15')}>
        {icon}
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value ?? '—'}</div>
      <div className="text-white/75 text-xs font-medium mt-0.5 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-white/50 text-xs mt-1">{sub}</div>}
    </div>
  );
}
