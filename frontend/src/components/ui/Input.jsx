import clsx from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, hint, className = '', ...props }, ref) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          'w-full border rounded-lg px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
    </div>
  );
});

export default Input;
