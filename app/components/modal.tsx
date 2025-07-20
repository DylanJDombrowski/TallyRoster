// app/components/modal.tsx
"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  description?: string; // 🔧 FIX: Optional description for accessibility
}

export function Modal({ isOpen, onClose, title, children, description }: ModalProps) {
  // 🔧 FIX: Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
      // 🔧 FIX: Accessibility attributes
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          {/* 🔧 FIX: Proper heading with ID for accessibility */}
          <h2 id="modal-title" className="text-xl font-semibold">
            {title}
          </h2>
          <button onClick={onClose} className="text-slate-800 hover:text-slate-900" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        {/* 🔧 FIX: Optional description for screen readers */}
        {description && (
          <div id="modal-description" className="sr-only">
            {description}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
