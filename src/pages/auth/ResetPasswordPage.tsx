import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api'
import './auth-pages.css'

function getResetPasswordErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data
  ) {
    const data = (error as { response: { data: { error?: unknown; message?: unknown } } }).response
      .data

    if (typeof data.error === 'string') {
      return data.error
    }

    if (typeof data.message === 'string') {
      return data.message
    }
  }

  return 'Unable to reset password. Please try again.'
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!token) {
      setError('Reset token is missing from the URL.')
      return
    }

    setIsSubmitting(true)

    try {
      await authApi.resetPassword({
        token,
        newPassword,
        confirmPassword,
      })
      setMessage('Password has been reset successfully. You can now log in.')
    } catch (err) {
      setError(getResetPasswordErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          Enter a new password for your account.
        </p>

        {!token ? <p className="auth-error">Reset token is missing. Open the link from your email again.</p> : null}

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-field">
            <span className="auth-label">New Password</span>
            <input
              className="auth-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Confirm Password</span>
            <input
              className="auth-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          {message ? <p className="auth-success">{message}</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-submit" type="submit" disabled={isSubmitting || !token}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-link-wrap">
          Back to{' '}
          <Link className="auth-link" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  )
}
