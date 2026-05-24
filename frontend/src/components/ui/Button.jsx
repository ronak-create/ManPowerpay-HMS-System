import clsx from 'clsx';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-light disabled:opacity-50',
  secondary: 'bg-white border border-primary text-primary hover:bg-primary/5 disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
  ghost: 'text-gray-600 hover:bg-gray-100 disabled:opacity-50',
  success: 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  return (
    <button
      className={clsx('rounded-lg font-medium transition inline-flex items-center gap-2 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
