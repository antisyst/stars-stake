import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import styles from './Toast.module.scss'
import type { ToastProps, ToastStatus } from '@/types'

import SuccessIconUrl from '@/assets/icons/check.svg'
import ErrorIcon from '@/assets/icons/error.svg?react'

const icons: Record<ToastStatus, React.ReactNode> = {
  success: <img src={SuccessIconUrl} alt="Success" />,
  error: <ErrorIcon className='icon'/>,
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
      className={styles.toast}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
    >
      <span className={styles.icon}>{icons[status]}</span>
      <span className={styles.title}>{title}</span>
    </motion.div>
  )
}