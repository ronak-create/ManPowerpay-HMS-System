import clsx from 'clsx';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={clsx('input-base appearance-none pr-10 cursor-pointer', error && 'input-error', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 font-medium">⚠ {error}</p>}
    </div>
  );
});

export default Select;
