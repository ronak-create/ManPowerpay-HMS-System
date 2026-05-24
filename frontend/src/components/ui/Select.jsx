import clsx from 'clsx';
import { forwardRef } from 'react';

const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        ref={ref}
        className={clsx('w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary', error ? 'border-red-400' : 'border-gray-300', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
});

export default Select;
