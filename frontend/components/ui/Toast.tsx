'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success', duration: number = 10000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} item={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onClose }: { item: ToastMessage; onClose: (id: number) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setExiting(true), item.duration - 300);
    const removeTimer = setTimeout(() => onClose(item.id), item.duration);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [item.id, item.duration, onClose]);

  const styles: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: 'bg-green-500', border: 'border-green-600', icon: '\u2713' },
    error: { bg: 'bg-red-500', border: 'border-red-600', icon: '\u2717' },
    info: { bg: 'bg-blue-500', border: 'border-blue-600', icon: 'i' },
    warning: { bg: 'bg-yellow-500', border: 'border-yellow-600', icon: '!' },
  };

  const s = styles[item.type];

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 px-4 py-1.5 ${s.bg} ${s.border} border text-white rounded-lg shadow-lg transition-all duration-300 ${
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      }`}
      role="alert"
    >
      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold shrink-0">
        {s.icon}
      </span>
      <p className="text-sm font-medium flex-1">{item.message}</p>
      <button
        onClick={() => onClose(item.id)}
        className="shrink-0 text-white/70 hover:text-white transition text-lg leading-none"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
}
