import { AlertTriangle, HelpCircle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

// Recessed neu icon badge, tinted per intent.
const intents = {
  danger:  { Icon: Trash2,         fg: 'text-red-600',    glow: 'rgba(239,68,68,.18)' },
  warning: { Icon: AlertTriangle,  fg: 'text-amber-600',  glow: 'rgba(217,119,6,.18)' },
  primary: { Icon: HelpCircle,     fg: 'text-primary-600',glow: 'rgba(217,119,6,.16)' },
};

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm Action', message, confirmLabel = 'Confirm', variant = 'danger', loading = false }) {
  const { Icon, fg, glow } = intents[variant] || intents.danger;
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4 mb-6">
        <span
          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-neu ${fg}`}
          style={{ boxShadow: `inset 3px 3px 7px rgba(176,148,112,.3), inset -3px -3px 7px rgba(255,255,255,.85), 0 0 0 3px ${glow}` }}
        >
          <Icon size={20} strokeWidth={2} />
        </span>
        <p className="text-zinc-600 text-sm leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant === 'primary' ? 'primary' : variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
