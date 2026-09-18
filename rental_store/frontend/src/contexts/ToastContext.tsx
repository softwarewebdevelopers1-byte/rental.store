import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
  durationMs: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  show: (message: string, tone?: ToastTone, durationMs?: number) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = "info", durationMs = 3500) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const toast: ToastItem = { id, tone, message, durationMs };
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({ toasts, show, dismiss }),
    [toasts, show, dismiss],
  );
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
