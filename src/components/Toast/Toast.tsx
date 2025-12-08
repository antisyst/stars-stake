import React, { useEffect } from 'react'
import { motion, type Variants } from 'framer-motion'
import { IconButton } from '@telegram-apps/telegram-ui'
import styles from './Toast.module.scss'
import type { ToastProps, ToastStatus } from '@/types'
import ErrorIcon from '@/assets/icons/error.svg?react';
import CheckIcon from '@/assets/icons/check.svg?react';

const icons: Record<ToastStatus, React.ReactNode> = {
  success: <CheckIcon className="icon" />,
  error: <ErrorIcon className="icon" />,
}

const containerVariants: Variants = {
  initial: { y: 28, opacity: 0, filter: 'blur(6px)', scale: 0.98 },
  animate: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: { type: 'tween', duration: 0.22 }
  },
  exit: {
    y: 28,
    opacity: 0,
    filter: 'blur(6px)',
    scale: 0.98,
    transition: { type: 'tween', duration: 0.18 }
  },
}

export const Toast: React.FC<ToastProps> = ({
  title,
  status,
  duration = 2000,
  onClose,
}) => {
  useEffect(() => {
    const timeout = setTimeout(onClose, duration)
    return () => clearTimeout(timeout)
  }, [duration, onClose])

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className={styles.toast}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <span className={styles.icon}>
        <IconButton mode="bezeled" size="s">
          {icons[status]}
        </IconButton>
      </span>
      <span className={styles.title}>{title}</span>
    </motion.div>
  )
}