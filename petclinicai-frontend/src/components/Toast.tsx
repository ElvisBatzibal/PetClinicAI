import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Toast = { id: number; title?: string; message: string; type?: 'success' | 'error' | 'info' };

type ToastContextType = {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const value = useMemo(() => ({ toasts, push, remove }), [toasts, push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, display: 'grid', gap: 8, zIndex: 50 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            minWidth: 260,
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#22c55e' : 'var(--primary)'}`,
            borderRadius: 10,
            boxShadow: '0 6px 24px rgba(2,6,23,0.18)',
            padding: '10px 12px',
          }}>
            {t.title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div>}
            <div style={{ fontSize: 14 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
