import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { groupsApi } from '@/api'
import BalanceSummary from '@/components/balances/BalanceSummary'
import ExpenseList from '@/components/expenses/ExpenseList'
import AddMemberModal from '@/components/groups/AddMemberModal'
import SettlementHistory from '@/components/settlements/SettlementHistory'
import { useAuthStore } from '@/store/authStore'
import type { Group, User } from '@/types'
import './group-detail-page.css'

type GroupDetailTab = 'expenses' | 'balances' | 'settlements'

function formatDate(value: string): string {
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

  return 'Failed to load group details.'
}

export default function GroupDetailPage() {
  const navigate = useNavigate()
  const { groupId } = useParams<{ groupId: string }>()
  const currentUserId = useAuthStore((state) => state.userId)

  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<GroupDetailTab>('expenses')
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showMembersPanel, setShowMembersPanel] = useState(false)
  const [members, setMembers] = useState<User[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setError('Invalid group ID.')
        setLoading(false)
        return
      }

      const parsedGroupId = Number(groupId)
      if (!Number.isInteger(parsedGroupId) || parsedGroupId <= 0) {
        setError('Invalid group ID.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await groupsApi.getById(parsedGroupId)
        setGroup(data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    void fetchGroup()
  }, [groupId])

  useEffect(() => {
    const fetchMembers = async () => {
      if (!showMembersPanel || !group) {
        return
      }

      setMembersLoading(true)
      setMembersError(null)
      try {
        const data = await groupsApi.getMembers(group.id)
        setMembers(data)
      } catch (err) {
        setMembersError(getErrorMessage(err))
      } finally {
        setMembersLoading(false)
      }
    }

    void fetchMembers()
  }, [showMembersPanel, group])

  if (loading) {
    return (
      <main className="group-detail-page">
        <section className="groups-state-card">
          <p>Loading group details...</p>
        </section>
      </main>
    )
  }

  if (error || !group) {
    return (
      <main className="group-detail-page">
        <section className="groups-state-card">
          <p className="groups-error">{error ?? 'Group not found.'}</p>
          <button className="groups-primary-btn" type="button" onClick={() => navigate('/')}>
            Back to groups
          </button>
        </section>
      </main>
    )
  }

  const isCreator = currentUserId !== null && group.createdBy.id === currentUserId

  const handleDeleteGroup = async () => {
    if (!isCreator || currentUserId === null) {
      return
    }

    const confirmed = window.confirm(
      'Delete this group? This action is permanent and removes expenses, settlements, and memberships.',
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    try {
      await groupsApi.deleteGroup(group.id, currentUserId)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <main className="group-detail-page">
      <header className="group-detail-header">
        <button className="groups-secondary-btn" type="button" onClick={() => navigate('/')}>
          ← Back
        </button>

        <div className="group-detail-actions">
          <button
            className="groups-primary-btn"
            type="button"
            onClick={() => setIsAddMemberOpen(true)}
          >
            Add member
          </button>

          {isCreator ? (
            <button
              className="groups-danger-btn"
              type="button"
              onClick={() => void handleDeleteGroup()}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete group'}
            </button>
          ) : null}
        </div>
      </header>

      <section className="group-detail-card">
        <div className="group-detail-card-top">
          <h1 className="group-detail-title">{group.name}</h1>
          <div className="group-options-wrap">
            <button
              type="button"
              className="group-options-btn"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
            >
              ...
            </button>

            {menuOpen ? (
              <div className="group-options-menu" role="menu">
                <button
                  type="button"
                  className="group-options-item"
                  role="menuitem"
                  onClick={() => {
                    setShowMembersPanel(true)
                    setMenuOpen(false)
                  }}
                >
                  Show members
                </button>
                <button
                  type="button"
                  className="group-options-item"
                  role="menuitem"
                  onClick={() => {
                    setShowMembersPanel(false)
                    setMenuOpen(false)
                  }}
                >
                  Hide members
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <p className="group-description">{group.description}</p>
        <p className="group-meta">
          <strong>Creator:</strong> {group.createdBy.name}
        </p>
        <p className="group-meta">
          <strong>Created:</strong> {formatDate(group.createdAt)}
        </p>
      </section>

      <section className={`group-detail-body ${showMembersPanel ? 'with-members' : ''}`}>
        <div className="group-detail-main-column">
          <section className="group-detail-tabs">
            <button
              className={`group-detail-tab ${activeTab === 'expenses' ? 'is-active' : ''}`}
              type="button"
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </button>
            <button
              className={`group-detail-tab ${activeTab === 'balances' ? 'is-active' : ''}`}
              type="button"
              onClick={() => setActiveTab('balances')}
            >
              Balances
            </button>
            <button
              className={`group-detail-tab ${activeTab === 'settlements' ? 'is-active' : ''}`}
              type="button"
              onClick={() => setActiveTab('settlements')}
            >
              Settlements
            </button>
          </section>

          <section className="group-detail-content">
            {activeTab === 'expenses' ? (
              <ExpenseList
                groupId={group.id}
                currentUserId={currentUserId}
                isGroupCreator={isCreator}
              />
            ) : null}
            {activeTab === 'balances' ? <BalanceSummary groupId={group.id} /> : null}
            {activeTab === 'settlements' ? <SettlementHistory groupId={group.id} /> : null}
          </section>
        </div>

        {showMembersPanel ? (
          <aside className="group-members-panel">
            <div className="group-members-header">
              <h3>Members</h3>
              <button
                type="button"
                className="groups-secondary-btn"
                onClick={() => setShowMembersPanel(false)}
              >
                Close
              </button>
            </div>

            {membersLoading ? <p className="group-members-state">Loading members...</p> : null}

            {!membersLoading && membersError ? (
              <p className="groups-error">{membersError}</p>
            ) : null}

            {!membersLoading && !membersError ? (
              <div className="group-members-list">
                {members.length === 0 ? (
                  <p className="group-members-state">No members found.</p>
                ) : (
                  members.map((member) => (
                    <article className="group-member-row" key={member.id}>
                      <p className="group-member-name">{member.name}</p>
                      <p className="group-member-id">ID: {member.id}</p>
                    </article>
                  ))
                )}
              </div>
            ) : null}
          </aside>
        ) : null}
      </section>

      <AddMemberModal
        open={isAddMemberOpen}
        groupId={group.id}
        onClose={() => setIsAddMemberOpen(false)}
        onAdded={() => {
          void groupsApi.getById(group.id).then(setGroup).catch(() => {
            // Keep current detail visible; add-member modal already handles its own feedback.
          })
          if (showMembersPanel) {
            void groupsApi.getMembers(group.id).then(setMembers).catch(() => {
              // Keep existing members visible; modal handles add feedback.
            })
          }
        }}
      />
    </main>
  )
}
