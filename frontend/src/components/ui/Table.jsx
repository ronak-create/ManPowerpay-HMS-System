import clsx from 'clsx';

export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full', className)}>
        {children}
      </table>
    </div>
  );
}
export function Thead({ children }) {
  return <thead>{children}</thead>;
}
export function Th({ children, className = '' }) {
  return (
    <th className={clsx(
      'px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100',
      'first:rounded-tl-2xl last:rounded-tr-2xl',
      className
    )}>
      {children}
    </th>
  );
}
export function Tbody({ children }) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}
export function Tr({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors duration-100',
        onClick ? 'cursor-pointer hover:bg-primary-50/30' : 'hover:bg-gray-50/50',
        className
      )}
    >
      {children}
    </tr>
  );
}
export function Td({ children, className = '' }) {
  return <td className={clsx('px-5 py-3.5 text-sm text-gray-700', className)}>{children}</td>;
}

// Wrapper with card styling
export function TableCard({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {children}
    </div>
  );
}
