import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthResponse } from '@/types'

interface AuthState {
  token: string | null
  userId: number | null
  name: string | null
  email: string | null
  role: string | null
  isAuthenticated: boolean
  setAuth: (res: AuthResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      name: null,
      email: null,
      role: null,
      isAuthenticated: false,
      setAuth: (res) =>
        set({
          token: res.token,
          userId: res.userId,
          name: res.name,
          email: res.email,
          role: res.role,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          userId: null,
          name: null,
          email: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'splitwise-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
