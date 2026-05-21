import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/firebase/firebase'
import { authApi } from '@/api'
import { useAuthStore } from '@/store/authStore'

interface GoogleAuthButtonProps {
  buttonText: string
  loadingText: string
}

function getGoogleAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code?: unknown }).code)

    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was closed before completion.'
    }

    if (code === 'auth/cancelled-popup-request') {
      return 'Google sign-in was cancelled.'
    }

    if (code === 'auth/account-exists-with-different-credential') {
      return 'This email is already linked with a different sign-in method.'
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data &&
    typeof (error as { response?: { data?: { error?: unknown; message?: unknown } } }).response?.data
      ?.error === 'string'
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message
  }

  return 'Unable to sign in with Google. Please try again.'
}

export default function GoogleAuthButton({ buttonText, loadingText }: GoogleAuthButtonProps) {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const credential = await signInWithPopup(auth, googleProvider)
      const firebaseToken = await credential.user.getIdToken(true)
      const response = await authApi.googleLogin({ token: firebaseToken })
      setAuth(response)
      navigate('/dashboard')
    } catch (err) {
      setError(getGoogleAuthErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-google-wrap">
      <div className="auth-divider" aria-hidden="true">
        <span>or</span>
      </div>

      <button
        className="auth-google-button"
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
      >
        <span className="auth-google-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="presentation" focusable="false">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.277 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.94 3.04l5.657-5.657C34.001 6.053 29.274 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.94 3.04l5.657-5.657C34.001 6.053 29.274 4 24 4c-7.838 0-14.63 4.43-17.694 10.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.204 0 9.931-1.995 13.49-5.245l-6.225-5.254C29.227 35.091 26.769 36 24 36c-5.255 0-9.621-3.315-11.258-7.946l-6.522 5.025C9.272 39.121 16.156 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a11.96 11.96 0 0 1-4.038 5.501l.003-.002 6.225 5.254C36.962 36.924 44 30.4 44 24c0-1.341-.138-2.651-.389-3.917z"
            />
          </svg>
        </span>
        <span>{isLoading ? loadingText : buttonText}</span>
      </button>

      {error ? <p className="auth-error">{error}</p> : null}
    </div>
  )
}
