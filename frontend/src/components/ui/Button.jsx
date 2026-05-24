import clsx from 'clsx';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-light shadow-sm hover:shadow',
  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  ghost: 'text-gray-600 hover:bg-gray-100',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
  outline: 'border border-primary text-primary hover:bg-primary/5',
};
const sizes = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg',
  sm: 'px-3.5 py-2 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-sm rounded-xl',
};

export default function Button({ children, variant = 'primary', size = 'md', loading = false, icon, className = '', ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : icon && <span className="flex-shrink-0">{icon}</span>
      }
      {children}
    </button>
  );
}
