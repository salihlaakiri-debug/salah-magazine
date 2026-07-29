"use client";

import { useEffect, useState, useCallback } from "react";
import { registerToastHandler, unregisterToastHandler } from "@/lib/toast";
import type { ToastMessage, ToastType, ToastPosition } from "@/lib/toast";
import { useSwipe } from "@/hooks/useSwipe";
import {
  CheckIcon, XIcon, AlertIcon, AlertTriangleIcon, ChevronDownIcon,
} from "@/components/Icons";

type ToastItem = ToastMessage & {
  exiting?: boolean;
  progressValue?: number;
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckIcon size={16} />,
  error: <XIcon size={16} />,
  info: <AlertIcon size={16} />,
  warning: <AlertTriangleIcon size={16} />,
};

const COLORS: Record<ToastType, string> = {
  success:
    "bg-emerald-600/90 dark:bg-emerald-600/90 border-emerald-500/30 shadow-emerald-500/10",
  error:
    "bg-red-600/90 dark:bg-red-600/90 border-red-500/30 shadow-red-500/10",
  info:
    "bg-accent/90 dark:bg-accent/90 border-accent-light/30 shadow-accent/10",
  warning:
    "bg-amber-600/90 dark:bg-amber-600/90 border-amber-500/30 shadow-amber-500/10",
};

const PROGRESS_COLORS: Record<ToastType, string> = {
  success: "bg-emerald-400",
  error: "bg-red-400",
  info: "bg-accent-light",
  warning: "bg-amber-400",
};

const POSITION_STYLES: Record<ToastPosition, string> = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-24 right-6",
  "top-left": "top-24 left-6",
  "top-center": "top-24 left-1/2 -translate-x-1/2",
};

const ENTRY_ANIMATIONS: Record<ToastPosition, string> = {
  "bottom-right": "animate-slide-in-right",
  "bottom-left": "animate-slide-in-left",
  "top-right": "animate-slide-in-right",
  "top-left": "animate-slide-in-left",
  "top-center": "animate-fade-in-up",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);
  const [swipedOut, setSwipedOut] = useState(false);
  const duration = toast.duration || 4000;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [toast.id, onDismiss]);

  const swipe = useSwipe({
    onSwipeLeft: () => { setSwipedOut(true); setTimeout(() => onDismiss(toast.id), 200); },
    onSwipeRight: () => { setSwipedOut(true); setTimeout(() => onDismiss(toast.id), 200); },
  });

  useEffect(() => {
    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  useEffect(() => {
    if (progress <= 0) dismiss();
  }, [progress, dismiss]);

  return (
    <div
      {...swipe}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-white text-sm
        ${COLORS[toast.type]}
        ${exiting ? "animate-slide-up opacity-0" : ENTRY_ANIMATIONS[toast.position || "bottom-right"]}
        ${swipedOut ? "translate-x-full opacity-0" : ""}
        transition-all duration-200 cursor-pointer select-none relative overflow-hidden
        min-w-[280px] max-w-[380px]`}
      onClick={dismiss}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{ICONS[toast.type]}</span>
      <span className="flex-1 leading-relaxed">{toast.text}</span>
      {toast.action && (
        <button
          onClick={(e) => { e.stopPropagation(); toast.action?.onClick(); dismiss(); }}
          className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
        aria-label="إغلاق"
      >
        <XIcon size={14} />
      </button>
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${PROGRESS_COLORS[toast.type]} transition-none`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts((prev) => [...prev, { ...toast, progressValue: 100 }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    registerToastHandler(addToast);
    return () => unregisterToastHandler();
  }, [addToast]);

  const grouped = toasts.reduce<Record<string, ToastItem[]>>((acc, t) => {
    const key = t.position || "bottom-right";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <>
      {children}
      {Object.entries(grouped).map(([position, items]) => (
        <div
          key={position}
          className={`fixed z-[100] flex flex-col gap-2 ${POSITION_STYLES[position as ToastPosition]}`}
          role="status"
          aria-live="polite"
        >
          {items.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </div>
      ))}
    </>
  );
}
