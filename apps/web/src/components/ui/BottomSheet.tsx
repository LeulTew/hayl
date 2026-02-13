import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, type PanInfo } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  desktopMode?: 'center' | 'sheet'; // Center modal on desktop vs sheet
}

export function BottomSheet({ isOpen, onClose, children, title, className, desktopMode = 'center' }: BottomSheetProps) {
  const controls = useAnimation();

  // Close on Escape & Enter Animation
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    // Trigger entry animation
    if (isOpen) {
        controls.start({ y: 0 });
    }

    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isOpen, controls]);

  // Drag logic
  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    } else {
      controls.start({ y: 0 });
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={onDragEnd}
            animate={controls}
            initial={{ y: "100%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
              fixed bottom-0 left-0 right-0 z-50 
              flex flex-col
              bg-hayl-bg border-t border-hayl-border 
              rounded-t-[32px] shadow-2xl
              max-h-[90vh] 
              md:max-w-md md:mx-auto md:rounded-[32px] md:bottom-8 md:border
              ${desktopMode === 'center' ? 'md:top-1/2 md:-translate-y-1/2 md:h-fit' : ''}
              ${className}
            `}
          >
            {/* Handle for dragging */}
            <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-hayl-border" />
            
            {/* Header */}
            {(title) && (
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
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
