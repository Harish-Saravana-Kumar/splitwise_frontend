import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) =>
    set((state) => ({
      toasts: [...state.toasts, { id: `${Date.now()}-${Math.random()}`, message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))

export const toastSuccess = (message: string) => useToastStore.getState().addToast(message, 'success')
export const toastError = (message: string) => useToastStore.getState().addToast(message, 'error')
export const toastInfo = (message: string) => useToastStore.getState().addToast(message, 'info')
