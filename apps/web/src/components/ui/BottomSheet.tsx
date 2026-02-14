import { type ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  desktopMode?: 'center' | 'sheet'; 
}

export function BottomSheet({ isOpen, onClose, children, title, className, desktopMode = 'center' }: BottomSheetProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isOpen]);

  if (typeof document === 'undefined') return null;

  const isCenter = desktopMode === 'center' && isDesktop;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet/Modal */}
          <motion.div
            initial={isCenter ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
            animate={isCenter ? { opacity: 1, scale: 1 } : { y: 0 }}
            exit={isCenter ? { opacity: 0, scale: 0.95 } : { y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
              relative z-10
              bg-hayl-bg border-hayl-border shadow-2xl
              flex flex-col w-full
              ${isCenter 
                ? 'md:max-w-md md:rounded-[32px] md:border p-2' 
                : 'rounded-t-[32px] border-t max-h-[90vh] pb-safe'
              }
              ${className}
            `}
          >
            {/* Drag Handle (Mobile Only) */}
            {!isDesktop && (
              <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-hayl-border" />
            )}
            
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-hayl-border/50">
                <h3 className="font-heading text-xl font-bold uppercase">{title}</h3>
                <button type="button" onClick={onClose} className="p-2 -mr-2 text-hayl-muted hover:text-hayl-text" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

