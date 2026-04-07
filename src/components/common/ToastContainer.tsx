import { useEffect } from 'react'
import { useToastStore } from '@/store/toastStore'
import './toast-container.css'

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        removeToast(toast.id)
      }, 3000),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [toasts, removeToast])

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <p className="toast-message">{toast.message}</p>
          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss notification"
            onClick={() => removeToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
