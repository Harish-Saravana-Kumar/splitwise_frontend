import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Skeleton from '@/components/common/Skeleton'
import { useGroups } from '@/hooks/useGroups'
import CreateGroupModal from '@/components/groups/CreateGroupModal'
import type { Group } from '@/types'
import './groups-page.css'

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

export default function GroupsPage() {
  const navigate = useNavigate()
  const { groups, loading, error, refetch } = useGroups()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <main className="groups-page">
      <header className="groups-header">
        <h1 className="groups-title">Your Groups</h1>
        <button className="groups-primary-btn" type="button" onClick={() => setIsCreateOpen(true)}>
          New group
        </button>
      </header>

      {loading ? (
        <section className="groups-grid" aria-label="Loading groups">
          {[1, 2, 3].map((item) => (
            <article key={item} className="group-card group-card-skeleton">
              <Skeleton height="1.05rem" width="70%" borderRadius="0.25rem" />
              <Skeleton lines={2} height="0.8rem" borderRadius="0.25rem" />
              <Skeleton height="0.8rem" width="45%" borderRadius="0.25rem" />
            </article>
          ))}
        </section>
      ) : null}

      {!loading && error ? (
        <section className="groups-state-card">
          <p className="groups-error">{error}</p>
          <button className="groups-primary-btn" type="button" onClick={() => void refetch()}>
            Retry
          </button>
        </section>
      ) : null}

      {!loading && !error ? (
        groups.length > 0 ? (
          <section className="groups-grid">
            {groups.map((group) => (
              <article
                key={group.id}
                className="group-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/groups/${group.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/groups/${group.id}`)
                  }
                }}
              >
                <h2 className="group-name">{group.name}</h2>
                <p className="group-description">{group.description}</p>
                <p className="group-meta">
                  <strong>Creator:</strong> {group.createdBy.name}
                </p>
                <p className="group-meta">
                  <strong>Created:</strong> {formatDate(group.createdAt)}
                </p>
              </article>
            ))}
          </section>
        ) : (
          <section className="groups-state-card">
            <p>No groups yet. Create your first group.</p>
          </section>
        )
      ) : null}

      <CreateGroupModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(_group: Group) => {
          void refetch()
        }}
      />
    </main>
  )
}
