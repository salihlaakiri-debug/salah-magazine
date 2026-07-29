"use client";

import { useEffect, useState, useCallback } from "react";
import { registerToastHandler, unregisterToastHandler } from "@/lib/toast";
import { CheckIcon, XIcon, AlertIcon } from "@/components/Icons";

type ToastType = "success" | "error" | "info";
type Toast = { id: string; text: string; type: ToastType };

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckIcon size={16} />,
  error: <XIcon size={16} />,
  info: <AlertIcon size={16} />,
};

const COLORS: Record<ToastType, string> = {
  success: "bg-green-600/90 border-green-500/30",
  error: "bg-red-600/90 border-red-500/30",
  info: "bg-accent/90 border-accent-light/30",
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    registerToastHandler(addToast);
    return () => unregisterToastHandler();
  }, [addToast]);

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm text-white text-sm animate-slide-up ${COLORS[toast.type]}`}
          >
            <span className="shrink-0">{ICONS[toast.type]}</span>
            <span className="flex-1">{toast.text}</span>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
              <XIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
