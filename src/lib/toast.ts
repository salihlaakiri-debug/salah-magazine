type ToastType = "success" | "error" | "info";

type ToastMessage = {
  id: string;
  text: string;
  type: ToastType;
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

export function showToast(text: string, type: ToastType = "info") {
  const id = `toast-${++counter}`;
  toastHandler?.({ id, text, type });
}
