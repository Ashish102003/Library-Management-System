import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { Button } from './FormControls';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="flex items-start gap-3.5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          danger ? 'bg-rose-50 text-rose-500' : 'bg-gold-soft text-gold'
        }`}
      >
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="pt-1.5 text-sm leading-relaxed text-muted">{message}</p>
    </div>
    <div className="mt-6 flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
