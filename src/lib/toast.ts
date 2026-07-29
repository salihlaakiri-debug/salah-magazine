export type ToastType = "success" | "error" | "info" | "warning";

export type ToastPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "top-center";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastMessage = {
  id: string;
  text: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
  action?: ToastAction;
  progress?: boolean;
};

type ToastHandler = (toast: ToastMessage) => void;

let toastHandler: ToastHandler | null = null;

export function registerToastHandler(handler: ToastHandler) {
  toastHandler = handler;
}

export function unregisterToastHandler() {
  toastHandler = null;
}

let counter = 0;

export function showToast(
  text: string,
  type: ToastType = "info",
  options?: {
    duration?: number;
    position?: ToastPosition;
    action?: ToastAction;
    progress?: boolean;
  }
) {
  const id = `toast-${++counter}`;
  toastHandler?.({
    id,
    text,
    type,
    duration: options?.duration ?? 4000,
    position: options?.position ?? "bottom-right",
    action: options?.action,
    progress: options?.progress ?? true,
  });
}
