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
  const [defaultDuration, setDefaultDuration] = useState(20000);

  useEffect(() => {
    fetch('/api/theme')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.alert_duration) {
          const ms = parseInt(data.data.alert_duration, 10);
          if (!isNaN(ms) && ms > 0) setDefaultDuration(ms);
        }
      })
      .catch(() => {});
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success', duration?: number) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type, duration: duration ?? defaultDuration }]);
  }, [defaultDuration]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Center-top container */}
      <div
        style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}
        className="flex flex-col items-center gap-2 pt-4 pointer-events-none w-full max-w-md"
      >
        {toasts.map(t => (
          <AlertItem key={t.id} item={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function AlertItem({ item, onClose }: { item: ToastMessage; onClose: (id: number) => void }) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    // Trigger enter -> visible immediately after mount
    const enterTimer = requestAnimationFrame(() => {
      setPhase('visible');
    });

    // Start exit animation before removal
    const exitTimer = setTimeout(() => setPhase('exit'), item.duration - 400);
    // Remove after exit animation completes
    const removeTimer = setTimeout(() => onClose(item.id), item.duration);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [item.id, item.duration, onClose]);

  const typeStyles: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
    success: { bg: 'bg-green-600', border: 'border-green-700', icon: '\u2713', iconBg: 'bg-green-500' },
    error: { bg: 'bg-red-600', border: 'border-red-700', icon: '\u2717', iconBg: 'bg-red-500' },
    info: { bg: 'bg-blue-600', border: 'border-blue-700', icon: 'i', iconBg: 'bg-blue-500' },
    warning: { bg: 'bg-amber-500', border: 'border-amber-600', icon: '!', iconBg: 'bg-amber-400' },
  };

  const s = typeStyles[item.type];

  // Animation styles based on phase
  const getTransform = () => {
    switch (phase) {
      case 'enter':
        return { transform: 'translateY(-100%)', opacity: 0 };
      case 'visible':
        return { transform: 'translateY(0)', opacity: 1 };
      case 'exit':
        return { transform: 'translateY(-100%)', opacity: 0 };
    }
  };

  const animStyle = getTransform();

  return (
    <div
      style={{
        ...animStyle,
        transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
      }}
      className={`pointer-events-auto flex items-center gap-3 px-5 py-3 ${s.bg} ${s.border} border text-white rounded-xl shadow-2xl min-w-[280px] max-w-full`}
      role="alert"
    >
      <span className={`w-7 h-7 flex items-center justify-center rounded-full ${s.iconBg} text-white text-sm font-bold shrink-0 shadow-inner`}>
        {s.icon}
      </span>
      <p className="text-sm font-medium flex-1 leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={() => onClose(item.id)}
        className="shrink-0 text-white/60 hover:text-white transition-colors text-xl leading-none ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
        aria-label="Dismiss alert"
      >
        &times;
      </button>
    </div>
  );
}
