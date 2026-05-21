import { useState } from 'react'
import type { FormEvent } from 'react'
import { groupsApi } from '@/api'
import { toastSuccess } from '@/store/toastStore'

interface AddMemberModalProps {
  open: boolean
  groupId: number
  onClose: () => void
  onAdded: () => void
}

function getErrorMessage(error: unknown): string {
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

  return 'Failed to add member. Please try again.'
}

export default function AddMemberModal({ open, groupId, onClose, onAdded }: AddMemberModalProps) {
  const [invitedEmail, setInvitedEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedEmail = invitedEmail.trim()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await groupsApi.inviteMember(groupId, { invitedEmail: trimmedEmail })
      toastSuccess('Invitation sent successfully.')
      setInvitedEmail('')
      onAdded()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="groups-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section className="groups-modal">
        <h2>Invite Member</h2>

        <form className="groups-form" onSubmit={handleSubmit}>
          <label className="groups-label">
            Invitee email
            <input
              className="groups-input"
              type="email"
              value={invitedEmail}
              onChange={(event) => setInvitedEmail(event.target.value)}
              required
            />
          </label>

          {error ? <p className="groups-error">{error}</p> : null}

          <div className="groups-modal-actions">
            <button type="button" className="groups-secondary-btn" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="groups-primary-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send invite'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
