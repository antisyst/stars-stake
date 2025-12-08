import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownProps } from '@/types';
import styles from './Dropdown.module.scss';

export const Dropdown: React.FC<DropdownProps> = ({ isOpen, onClose, items, position = 'right', triggerRef }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          (!triggerRef?.current || !triggerRef.current.contains(event.target as Node))) {
        onClose();
      }
    };

    const handleAnyScrollOrMove = () => {
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('wheel', handleAnyScrollOrMove, { passive: true });
    window.addEventListener('scroll', handleAnyScrollOrMove, { passive: true });
    window.addEventListener('touchmove', handleAnyScrollOrMove, { passive: true });
    window.addEventListener('resize', handleAnyScrollOrMove);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('wheel', handleAnyScrollOrMove);
      window.removeEventListener('scroll', handleAnyScrollOrMove);
      window.removeEventListener('touchmove', handleAnyScrollOrMove);
      window.removeEventListener('resize', handleAnyScrollOrMove);
    };
  }, [isOpen, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className={`${styles.dropdown} ${styles[`position-${position}`]}`}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 30,
            mass: 0.35,
          }}
          style={{ transformOrigin: 'top center' }}
          role="menu"
          aria-hidden={!isOpen}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={styles.item}
              onClick={() => {
                try { item.onClick(); } catch (e) { console.error(e); }
                onClose();
              }}
              role="menuitem"
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};