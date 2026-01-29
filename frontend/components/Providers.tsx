'use client';

import { ToastProvider } from '@/frontend/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
