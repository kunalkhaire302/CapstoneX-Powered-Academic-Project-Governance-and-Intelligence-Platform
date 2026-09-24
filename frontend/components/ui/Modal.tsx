'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  description?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hideCloseButton?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children, 
  footer,
  size = 'md',
  className = '',
  hideCloseButton = false
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      // Focus the close button on open
      setTimeout(() => closeRef.current?.focus(), 50);
      return () => {
        document.body.style.overflow = '';
        previouslyFocusedRef.current?.focus();
      };
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
    
    if (focusableElements.length === 0) return;

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

  if (!isOpen || !mounted) return null;

  const sizes = { 
    sm: 'max-w-sm', 
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl' 
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cx-bg-overlay backdrop-blur-sm animate-fade-in"
        style={{ animationDuration: '200ms' }}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className={cn(
        "relative bg-cx-surface rounded-2xl shadow-xl w-full animate-scale-in flex flex-col overflow-hidden max-h-[90vh]",
        sizes[size],
        className
      )}>
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-cx-border-subtle flex-shrink-0 bg-cx-surface">
            <div>
              {title && (
                <h3 id="modal-title" className="text-lg font-display font-semibold text-cx-text">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1.5 text-sm text-cx-text-secondary">
                  {description}
                </p>
              )}
            </div>
            
            {!hideCloseButton && (
              <button
                ref={closeRef}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-cx-text-muted hover:text-cx-text hover:bg-cx-bg-muted transition-colors ml-4 flex-shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto bg-cx-bg">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-cx-border-subtle bg-cx-surface flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
