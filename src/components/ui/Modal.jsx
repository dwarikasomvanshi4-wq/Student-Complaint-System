'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Animated modal dialog with backdrop, close button, and Framer Motion transitions.
 *
 * Requirements: 13.4
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when backdrop or close button is clicked
 * @param {string} [title] - Optional title displayed in the modal header
 * @param {React.ReactNode} children - Modal body content
 * @param {string} [className] - Additional CSS classes for the modal panel
 */
export default function Modal({ isOpen, onClose, title, children, className }) {
  return (
    <AnimatePresence>
      {isOpen && (
        // Backdrop
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Modal panel */}
          <motion.div
            key="modal-panel"
            className={cn(
              'relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl mx-4 sm:mx-0',
              className
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            // Prevent backdrop click from closing when clicking inside the panel
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              {title ? (
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-slate-900"
                >
                  {title}
                </h2>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
