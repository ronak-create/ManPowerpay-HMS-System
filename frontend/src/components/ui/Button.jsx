import clsx from 'clsx';

const variants = {
  primary:  'btn-primary',
  secondary:'btn-secondary',
  danger:   'btn-danger',
  ghost:    'btn-ghost',
  success:  'btn-success',
  outline:  'btn inline-flex px-4 py-2.5 text-sm border border-amber-500 text-amber-700 hover:bg-amber-50 rounded-xl',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg',
  sm: 'px-3.5 py-2 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-sm rounded-xl',
};

export default function Button({ children, variant = 'primary', size = 'md', loading = false, icon, className = '', ...props }) {
  const base = variants[variant];
  const hasExplicitSize = base?.includes('px-');
  return (
    <button
      className={clsx(
        !base?.includes('btn-') && !base?.includes('btn ') ? 'btn' : '',
        base,
        !hasExplicitSize && sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        : icon && <span className="flex-shrink-0 mr-2">{icon}</span>
      }
      {children}
    </button>
  );
}
