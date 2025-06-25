// app/components/toast-provider.tsx
"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type ToastType = "success" | "error";

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((currentToast) => (currentToast ? { ...currentToast, visible: false } : null));
    }, 3000);
  };

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 z-50 ${
            // Added z-50
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } ${toast.visible ? "opacity-100" : "opacity-0"}`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
