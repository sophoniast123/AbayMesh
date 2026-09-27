"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
      />
      <div className="animate-fade-in relative w-full max-w-md rounded-2xl border border-navy-100 bg-white p-6 shadow-lift">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
          >
            &#10005;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
