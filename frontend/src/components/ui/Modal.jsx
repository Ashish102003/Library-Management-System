import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, subtitle, children, size = 'md' }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
      <div className="fixed inset-0 animate-backdrop-in bg-navy/30 backdrop-blur-[3px]" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${sizes[size]} animate-modal-in rounded-t-[22px] border border-line/70 bg-white shadow-[0_24px_70px_rgba(41,37,34,0.24)] sm:rounded-[22px]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line/80 px-6 pb-4 pt-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-1.5 rounded-lg p-1.5 text-faint transition hover:bg-surface hover:text-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-9.5rem)] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
