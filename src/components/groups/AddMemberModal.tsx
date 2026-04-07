import { useState } from 'react'
import type { FormEvent } from 'react'
import { groupsApi } from '@/api'

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
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!open) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const parsedUserId = Number(userId)
    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setError('Please enter a valid user ID.')
      return
    }

    setLoading(true)
    try {
      await groupsApi.addMember(groupId, parsedUserId)
      setSuccess('Member added successfully.')
      setUserId('')
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
        <h2>Add Member</h2>

        <form className="groups-form" onSubmit={handleSubmit}>
          <label className="groups-label">
            User ID
            <input
              className="groups-input"
              type="number"
              min={1}
              step={1}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            />
          </label>

          {error ? <p className="groups-error">{error}</p> : null}
          {success ? <p className="groups-success">{success}</p> : null}

          <div className="groups-modal-actions">
            <button type="button" className="groups-secondary-btn" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="groups-primary-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add member'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
