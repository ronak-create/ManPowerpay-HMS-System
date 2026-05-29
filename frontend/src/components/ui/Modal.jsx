import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

export default function Modal({ open, onClose, title, subtitle, children, size = 'md', footer }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(9,9,11,.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={clsx(
        'relative bg-white rounded-2xl w-full flex flex-col animate-slide-up',
        sizes[size],
        'max-h-[90vh]'
      )}
           style={{ boxShadow: '0 24px 80px -12px rgba(0,0,0,.3), 0 0 0 1px rgba(0,0,0,.05)' }}>
        {/* Amber top accent line */}
        <div className="h-px rounded-t-2xl w-full"
             style={{ background: 'linear-gradient(90deg, #D97706, #F59E0B, #FBBF24)' }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-zinc-900">{title}</h3>
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-zinc-100 flex items-center justify-center transition-colors ml-4 flex-shrink-0 text-zinc-400 hover:text-zinc-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
