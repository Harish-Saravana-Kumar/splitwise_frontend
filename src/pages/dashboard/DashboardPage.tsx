import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '@/api'
import type { DashboardResponse } from '@/types'
import './dashboard-page.css'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Math.abs(value))
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

  return 'Failed to load dashboard.'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await dashboardApi.getMyDashboard()
        setDashboard(data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    void fetchDashboard()
  }, [])

  if (loading) {
    return (
      <main className="dashboard-page">
        <section className="groups-state-card">
          <p>Loading dashboard...</p>
        </section>
      </main>
    )
  }

  if (error || !dashboard) {
    return (
      <main className="dashboard-page">
        <section className="groups-state-card">
          <p className="groups-error">{error ?? 'Unable to load dashboard.'}</p>
          <button className="groups-primary-btn" type="button" onClick={() => navigate('/')}>
            Back to groups
          </button>
        </section>
      </main>
    )
  }

  const net = dashboard.totalPaid - dashboard.totalOwes
  const hasNoData =
    dashboard.totalPaid === 0 &&
    dashboard.totalOwes === 0 &&
    dashboard.groupSummaries.length === 0 &&
    dashboard.personBalances.length === 0

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Track your totals, group-wise exposure, and person-to-person balances.</p>
      </header>

      <section className="dashboard-summary-grid">
        <article className="dashboard-card is-positive">
          <h3>Total Paid</h3>
          <p>{formatCurrency(dashboard.totalPaid)}</p>
        </article>

        <article className="dashboard-card is-negative">
          <h3>Total Owes</h3>
          <p>{formatCurrency(dashboard.totalOwes)}</p>
        </article>

        <article className={`dashboard-card ${net >= 0 ? 'is-positive' : 'is-negative'}`}>
          <h3>Net Position</h3>
          <p>{net >= 0 ? `+ ${formatCurrency(net)}` : `- ${formatCurrency(net)}`}</p>
        </article>
      </section>

      <section className="dashboard-section">
        <h2>Expenses By Group</h2>
        {dashboard.groupSummaries.length === 0 ? (
          <div className="groups-state-card">
            <p>No group data available.</p>
          </div>
        ) : (
          <div className="dashboard-list">
            {dashboard.groupSummaries.map((group) => (
              <article className="dashboard-list-row" key={group.groupId}>
                <div>
                  <p className="dashboard-row-title">{group.groupName}</p>
                  <p className="dashboard-row-sub">Total Expense: {formatCurrency(group.totalExpense)}</p>
                </div>
                <div className="dashboard-row-right">
                  <p className="dashboard-row-sub">Your Net</p>
                  <p className={group.userNetBalance >= 0 ? 'tone-positive' : 'tone-negative'}>
                    {group.userNetBalance >= 0
                      ? `+ ${formatCurrency(group.userNetBalance)}`
                      : `- ${formatCurrency(group.userNetBalance)}`}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Person-To-Person Owes</h2>
        {dashboard.personBalances.length === 0 ? (
          <div className="groups-state-card">
            <p>No person-to-person balances.</p>
          </div>
        ) : (
          <div className="dashboard-list">
            {dashboard.personBalances.map((row) => (
              <article className="dashboard-list-row" key={row.userId}>
                <div>
                  <p className="dashboard-row-title">{row.userName}</p>
                  <p className="dashboard-row-sub">User ID: {row.userId}</p>
                </div>
                <div className="dashboard-row-right">
                  {row.netAmount < 0 ? (
                    <p className="tone-negative">You owe {formatCurrency(row.netAmount)}</p>
                  ) : (
                    <p className="tone-positive">Owes you {formatCurrency(row.netAmount)}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {hasNoData ? (
        <section className="dashboard-onboarding">
          <h2>How To Begin</h2>
          <p>Looks like your account is new. Start here to manage your amounts easily.</p>
          <ol className="dashboard-onboarding-list">
            <li>Create a group in the Groups page.</li>
            <li>Add members using their User ID.</li>
            <li>Add expenses with EQUAL, EXACT, PERCENTAGE, or SHARES split.</li>
            <li>Use settlements to clear dues and keep balances up to date.</li>
          </ol>
          <button className="groups-primary-btn" type="button" onClick={() => navigate('/')}>
            Go to Groups
          </button>
        </section>
      ) : null}
    </main>
  )
}
