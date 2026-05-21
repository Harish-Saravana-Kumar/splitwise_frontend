import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupsApi } from '@/api'
import { toastSuccess } from '@/store/toastStore'
import type { GroupInvitation } from '@/types'
import './invitations-page.css'

function formatDate(value: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
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

  return 'Unable to load invitations.'
}

export default function InvitationsPage() {
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState<GroupInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchInvitations = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await groupsApi.getPendingInvitations()
      setInvitations(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchInvitations()
  }, [])

  const handleAccept = async (invitation: GroupInvitation) => {
    setActionLoading(invitation.id)
    try {
      await groupsApi.acceptInvitation(invitation.id)
      toastSuccess(`Joined ${invitation.groupName}.`)
      await fetchInvitations()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (invitation: GroupInvitation) => {
    setActionLoading(invitation.id)
    try {
      await groupsApi.rejectInvitation(invitation.id)
      toastSuccess(`Declined invitation to ${invitation.groupName}.`)
      await fetchInvitations()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <main className="invitations-page">
      <header className="invitations-header">
        <button className="groups-secondary-btn" type="button" onClick={() => navigate('/')}
          >
          ← Back
        </button>
        <div>
          <h1 className="invitations-title">Group Invitations</h1>
          <p className="invitations-subtitle">Review and respond to pending invites.</p>
        </div>
      </header>

      {loading ? <p className="invitations-state">Loading invitations...</p> : null}
      {error ? <p className="groups-error">{error}</p> : null}

      {!loading && !error ? (
        invitations.length === 0 ? (
          <p className="invitations-state">No pending invitations.</p>
        ) : (
          <section className="invitations-list">
            {invitations.map((invitation) => (
              <article className="invitation-card" key={invitation.id}>
                <div className="invitation-details">
                  <div>
                    <p className="invitation-group">{invitation.groupName}</p>
                    <p className="invitation-meta">Invited by {invitation.invitedBy.name}</p>
                  </div>
                  <span className="invitation-status">{invitation.status}</span>
                </div>
                <div className="invitation-meta-row">
                  <span>Requested: {formatDate(invitation.createdAt)}</span>
                  <span>Responded: {formatDate(invitation.respondedAt)}</span>
                </div>
                <div className="invitation-actions">
                  <button
                    type="button"
                    className="groups-primary-btn"
                    onClick={() => void handleAccept(invitation)}
                    disabled={actionLoading === invitation.id}
                  >
                    {actionLoading === invitation.id ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    type="button"
                    className="groups-secondary-btn"
                    onClick={() => void handleReject(invitation)}
                    disabled={actionLoading === invitation.id}
                  >
                    {actionLoading === invitation.id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )
      ) : null}
    </main>
  )
}
