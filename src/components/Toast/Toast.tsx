import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSignal } from '@telegram-apps/sdk-react'
import { viewport } from '@telegram-apps/sdk'
import styles from './Toast.module.scss'
import type { ToastProps, ToastStatus } from '@/types'

import SuccessIconUrl from '@/assets/check.svg'
import ErrorIconUrl from '@/assets/close.svg'

const icons: Record<ToastStatus, React.ReactNode> = {
  success: <img src={SuccessIconUrl} alt="Success" />,
  error: <img src={ErrorIconUrl} alt="Error" />,
}

const Toast: React.FC<ToastProps> = ({
  title,
  status,
  duration = 2000,
  onClose,
}) => {

  const cTop = useSignal(viewport.contentSafeAreaInsetTop);
  const sTop = useSignal(viewport.safeAreaInsetTop);
  const Top = Math.max(cTop ?? 0, sTop ?? 0);

  useEffect(() => {
    const timeout = setTimeout(onClose, duration)
    return () => clearTimeout(timeout)
  }, [duration, onClose])

  return (
    <motion.div
      className={styles.toast}
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      style={{top: `${Top + 47}px`}}
    >
      <span className={styles.icon}>{icons[status]}</span>
      <span className={styles.title}>{title}</span>
    </motion.div>
  )
}

export default Toast