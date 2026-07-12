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

      {/* Dialog — raised ivory neumorphic panel */}
      <div className={clsx(
        'relative bg-neu rounded-2xl w-full flex flex-col animate-slide-up overflow-hidden',
        sizes[size],
        'max-h-[90vh]'
      )}
           style={{ boxShadow: '22px 22px 60px rgba(20,15,8,.45), -10px -10px 30px rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.4)' }}>
        {/* Amber top accent line */}
        <div className="h-1 w-full flex-shrink-0"
             style={{ background: 'linear-gradient(90deg, #D97706, #F59E0B, #FBBF24)' }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E4DED2] flex-shrink-0">
          <div>
            <h3 className="font-semibold text-zinc-900">{title}</h3>
            {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="btn-icon ml-4 flex-shrink-0 text-zinc-500 hover:text-zinc-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#E4DED2] bg-[#E9E3D8]/40 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
