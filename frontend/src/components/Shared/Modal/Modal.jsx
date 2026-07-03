import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, description, children, maxWidth }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          id="modal-overlay" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[3px] flex items-center justify-center z-[1000] p-4"
          onClick={handleOverlayClick}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-bg-card border border-border-subtle rounded-xl shadow-premium w-full ${maxWidth || 'max-w-[480px]'} p-8 relative`}
          >
            <button 
              className="absolute top-4 right-4 text-text-muted hover:text-text-main hover:bg-neutral-50 p-1.5 rounded-md cursor-pointer transition focus:outline-none"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
            {title && <h3 className="text-lg font-semibold text-text-main mb-1">{title}</h3>}
            {description && <p className="text-sm text-text-muted mb-6">{description}</p>}
            <div className="mt-2">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
