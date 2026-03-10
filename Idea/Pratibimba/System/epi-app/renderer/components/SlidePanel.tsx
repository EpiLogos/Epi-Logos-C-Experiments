import { motion, AnimatePresence } from 'framer-motion';

export interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * SlidePanel - Subdomain views panel (always full screen when open)
 *
 * - Slides smoothly from right edge
 * - Fills from sidebar (64px) to right edge
 * - No header/border - content only
 * - Click outside or X to close
 */
export function SlidePanel({ isOpen, onClose, children }: SlidePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for click-outside-to-close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-20 bg-black/50"
            style={{ left: '40px', top: '40px' }}
            onClick={onClose}
          />

          {/* Panel - full width from sidebar to right */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className="fixed top-[40px] right-0 bottom-0 overflow-hidden z-25 opaque-panel"
            style={{ left: '40px' }}
          >
            {/* Content - no header, just scrollable content */}
            <div className="h-full overflow-auto custom-scrollbar">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
