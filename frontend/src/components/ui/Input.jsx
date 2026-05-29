import clsx from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, hint, prefix, suffix, className = '', ...props }, ref) {
  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-sm">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'input-base',
            error && 'input-error',
            prefix && 'pl-10',
            suffix && 'pr-10',
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-sm">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && <p className="text-zinc-400 text-xs mt-1 font-normal">{hint}</p>}
    </div>
  );
});

export default Input;
