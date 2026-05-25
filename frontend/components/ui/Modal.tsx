'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button on open
      setTimeout(() => closeRef.current?.focus(), 50);
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [isOpen, onClose]);

  // Basic focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-thunder/60 backdrop-blur-sm animate-fade-in"
        style={{ animationDuration: '0.2s' }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Content */}
      <div className={`relative bg-white rounded-2xl shadow-xl ${sizes[size]} w-full animate-scale-in overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 id="modal-title" className="text-lg font-display text-thunder">{title}</h3>
          <button
            ref={closeRef}
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate hover:text-thunder hover:bg-gray-100 transition-all"
            aria-label="Close dialog"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
