import clsx from 'clsx';

export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className={clsx('min-w-full divide-y divide-gray-200 text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }) {
  return <thead className="bg-primary">{children}</thead>;
}

export function Th({ children, className = '' }) {
  return <th className={clsx('px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider', className)}>{children}</th>;
}

export function Tbody({ children }) {
  return <tbody className="bg-white divide-y divide-gray-100">{children}</tbody>;
}

export function Tr({ children, onClick, className = '' }) {
  return <tr onClick={onClick} className={clsx('hover:bg-gray-50 transition', onClick && 'cursor-pointer', className)}>{children}</tr>;
}

export function Td({ children, className = '' }) {
  return <td className={clsx('px-4 py-3 text-gray-700', className)}>{children}</td>;
}
