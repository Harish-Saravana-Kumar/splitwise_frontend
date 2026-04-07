import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { groupsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { Group } from '@/types'
import './create-group-modal.css'

interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
  onCreated: (group: Group) => void
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

  return 'Failed to create group. Please try again.'
}

export default function CreateGroupModal({ open, onClose, onCreated }: CreateGroupModalProps) {
  const userId = useAuthStore((state) => state.userId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (!loading) {
      setError(null)
      onClose()
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, loading])

  if (!open) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!userId) {
      setError('You must be logged in to create a group.')
      return
    }

    setLoading(true)
    try {
      const group = await groupsApi.create(userId, { name, description })
      onCreated(group)
      handleClose()
      setName('')
      setDescription('')
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
          handleClose()
        }
      }}
    >
      <section className="groups-modal">
        <h2>Create Group</h2>
        <form className="groups-form" onSubmit={handleSubmit}>
          <label className="groups-label">
            Name
            <input
              className="groups-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
            />
          </label>

          <label className="groups-label">
            Description
            <textarea
              className="groups-input groups-textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={500}
            />
          </label>

          {error ? <p className="groups-error">{error}</p> : null}

          <div className="groups-modal-actions">
            <button
              type="button"
              className="groups-secondary-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="groups-primary-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
