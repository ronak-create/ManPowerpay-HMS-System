import clsx from 'clsx';

export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full border-collapse', className)}>{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return <thead>{children}</thead>;
}

export function Th({ children, className = '' }) {
  return (
    <th className={clsx(
      'px-5 py-3.5 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest bg-zinc-50/80 border-b border-zinc-100',
      className
    )}>
      {children}
    </th>
  );
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-zinc-50">{children}</tbody>;
}

export function Tr({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors duration-100',
        onClick ? 'cursor-pointer hover:bg-amber-50/30' : 'hover:bg-zinc-50/60',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }) {
  return <td className={clsx('px-5 py-3.5 text-sm text-zinc-700', className)}>{children}</td>;
}

export function TableCard({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-card overflow-hidden">
      {children}
    </div>
  );
}
