import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function MobileSidebar({ open, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-sidebar flex flex-col shadow-sidebar
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </>
  );
}
