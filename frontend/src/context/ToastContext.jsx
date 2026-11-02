import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
      <CheckCircle2 className="h-4.5 w-4.5" />
    </span>
  ),
  error: (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600">
      <AlertCircle className="h-4.5 w-4.5" />
    </span>
  ),
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, type = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  const toast = {
    success: (msg) => pushToast(msg, 'success'),
    error: (msg) => pushToast(msg, 'error'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-2xl border border-line/70 bg-white px-4 py-3.5 shadow-lift"
          >
            {icons[t.type]}
            <p className="flex-1 pt-1.5 text-sm font-medium leading-snug text-navy">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="mt-1.5 text-faint transition hover:text-navy"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
