import { useEffect, useState } from 'react'
import { settlementsApi } from '@/api'
import Skeleton from '@/components/common/Skeleton'
import type { Settlement } from '@/types'
import './settlement-history.css'
import { useAuthStore } from '@/store/authStore'

interface SettlementHistoryProps {
  groupId: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

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

  return 'Failed to load settlements.'
}

export default function SettlementHistory({ groupId }: SettlementHistoryProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentUserId = useAuthStore((state) => state.userId)

  useEffect(() => {
    const fetchSettlements = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await settlementsApi.getByGroup(groupId)
        if (currentUserId != null) {
          // show only settlements where the current user is the payer (i.e., owes)
          setSettlements(data.filter((s) => s.payer.id === currentUserId))
        } else {
          setSettlements([])
        }
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    void fetchSettlements()
  }, [groupId, currentUserId])

  return (
    <section className="settlement-history-panel">
      {loading ? (
        <div className="settlement-skeleton-list" aria-label="Loading settlements">
          {[1, 2, 3].map((item) => (
            <article className="settlement-item settlement-item-skeleton" key={item}>
              <Skeleton height="1rem" width="65%" />
              <Skeleton height="0.82rem" width="40%" />
            </article>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="groups-state-card">
          <p className="groups-error">{error}</p>
        </div>
      ) : null}

      {!loading && !error && settlements.length === 0 ? (
        <div className="groups-state-card">
          <p>No settlements yet</p>
        </div>
      ) : null}

      {!loading && !error && settlements.length > 0 ? (
        <ol className="settlement-timeline">
          {settlements.map((settlement) => (
            <li key={settlement.id} className="settlement-item">
              <p className="settlement-title">
                {settlement.payer.name} → {settlement.receiver.name}
              </p>
              <p className="settlement-amount">{formatCurrency(settlement.amount)}</p>
              <p className="settlement-date">{formatDate(settlement.settledAt)}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
