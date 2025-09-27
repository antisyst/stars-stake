import React, { createContext, useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Toast from '@/components/Toast/Toast';
import type {
  ToastOptions,
  ToastContextType,
  ToastProviderProps,
} from '@/types';


export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
})


export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null)

  const showToast = useCallback((opts: ToastOptions) => {
    setToast({ ...opts, id: Date.now() })
  }, [])

  const showSuccess = useCallback((title: string, duration?: number) => {
    showToast({ title, status: 'success', duration })
  }, [showToast])

  const showError = useCallback((title: string, duration?: number) => {
    showToast({ title, status: 'error', duration })
  }, [showToast])

  const handleClose = useCallback(() => {
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}

      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            title={toast.title}
            status={toast.status}
            duration={toast.duration}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}