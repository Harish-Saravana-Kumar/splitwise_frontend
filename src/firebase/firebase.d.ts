declare module '@/firebase/firebase' {
  import type { Auth, GoogleAuthProvider } from 'firebase/auth'
  import type { FirebaseApp } from 'firebase/app'

  export const auth: Auth
  export const googleProvider: GoogleAuthProvider
  const app: FirebaseApp
  export default app
}
