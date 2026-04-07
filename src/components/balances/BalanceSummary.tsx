import { useEffect, useMemo, useState } from 'react'
import { balancesApi, expensesApi, usersApi } from '@/api'
import SettleUpModal from '@/components/settlements/SettleUpModal'
import { useAuthStore } from '@/store/authStore'
import type { Expense, GroupBalances, SettlementSuggestion } from '@/types'
import './balance-summary.css'

interface BalanceSummaryProps {
  groupId: number
}

type BalanceViewFilter = 'debts' | 'suggestions' | 'expense-splits'

function getSuggestionPayerId(item: SettlementSuggestion): number | null {
  if (typeof item.payerId === 'number' && Number.isInteger(item.payerId) && item.payerId > 0) {
    return item.payerId
  }

  if (item.payer && Number.isInteger(item.payer.id) && item.payer.id > 0) {
    return item.payer.id
  }

  return null
}

function getSuggestionReceiverId(item: SettlementSuggestion): number | null {
  if (
    typeof item.receiverId === 'number' &&
    Number.isInteger(item.receiverId) &&
    item.receiverId > 0
  ) {
    return item.receiverId
  }

  if (item.receiver && Number.isInteger(item.receiver.id) && item.receiver.id > 0) {
    return item.receiver.id
  }

  return null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Math.abs(value))
}

function getExpenseSplitStatus(expense: Expense, split: Expense['splits'][number]): {
  text: string
  tone: 'paid' | 'owed' | 'settled'
} {
  if (split.user.id === expense.paidBy.id) {
    return { text: 'paid by', tone: 'paid' }
  }

  if (split.settled) {
    return { text: 'settled', tone: 'settled' }
  }

  return { text: `owes ${formatCurrency(split.owedAmount)}`, tone: 'owed' }
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

  return 'Failed to load balances.'
}

export default function BalanceSummary({ groupId }: BalanceSummaryProps) {
  const currentUserId = useAuthStore((state) => state.userId)
  const [balances, setBalances] = useState<GroupBalances>({})
  const [suggestions, setSuggestions] = useState<SettlementSuggestion[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [userNames, setUserNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<SettlementSuggestion | null>(null)
  const [activeFilter, setActiveFilter] = useState<BalanceViewFilter>('debts')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [balancesRes, suggestionsRes, expensesRes] = await Promise.all([
        balancesApi.getGroupBalances(groupId),
        balancesApi.getSettlementSuggestions(groupId),
        expensesApi.getByGroup(groupId),
      ])

      const userIds = new Set<number>()
      Object.keys(balancesRes).forEach((id) => {
        const parsed = Number(id)
        if (Number.isInteger(parsed) && parsed > 0) {
          userIds.add(parsed)
        }
      })

      suggestionsRes.forEach((item) => {
        const payerId = getSuggestionPayerId(item)
        const receiverId = getSuggestionReceiverId(item)
        if (payerId !== null) {
          userIds.add(payerId)
        }
        if (receiverId !== null) {
          userIds.add(receiverId)
        }
      })

      const resolvedNames: Record<string, string> = {}
      await Promise.all(
        Array.from(userIds).map(async (id) => {
          try {
            const user = await usersApi.getById(id)
            resolvedNames[String(id)] = user.name
          } catch {
            resolvedNames[String(id)] = `User ${id}`
          }
        }),
      )

      setBalances(balancesRes)
      setSuggestions(suggestionsRes)
      setExpenses(expensesRes)
      setUserNames(resolvedNames)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [groupId])

  const balanceEntries = useMemo(() => Object.entries(balances), [balances])
  const expenseEntries = useMemo(() => expenses, [expenses])
  const debtEntries = useMemo(
    () => balanceEntries.filter(([, netAmount]) => Number(netAmount) < 0),
    [balanceEntries],
  )

  return (
    <section className="balance-panel">
      <header className="balance-header">
        <h3 className="balance-title">Balances</h3>
        <label className="balance-filter" htmlFor="balance-view-filter">
          <span>Filter</span>
          <select
            id="balance-view-filter"
            className="balance-filter-select"
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value as BalanceViewFilter)}
          >
            <option value="debts">Balance Debts</option>
            <option value="suggestions">Settlement Suggestions</option>
            <option value="expense-splits">Expense-Wise Member Splits</option>
          </select>
        </label>
      </header>

      {loading ? (
        <div className="groups-state-card">
          <p>Loading balances...</p>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="groups-state-card">
          <p className="groups-error">{error}</p>
          <button className="groups-primary-btn" type="button" onClick={() => void fetchData()}>
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          {activeFilter === 'debts' ? (
            <div className="balance-list">
              {debtEntries.length === 0 ? (
                <div className="groups-state-card">
                  <p>No debts right now.</p>
                </div>
              ) : (
                debtEntries.map(([userId, netAmount]) => {
                  const value = Number(netAmount)
                  const displayName = userNames[userId] ?? `User ${userId}`
                  return (
                    <article className="balance-row" key={userId}>
                      <span className="balance-user">{displayName}</span>
                      <span className="balance-text is-negative">owes {formatCurrency(value)}</span>
                    </article>
                  )
                })
              )}
            </div>
          ) : null}

          {activeFilter === 'suggestions' ? (
            <section className="suggestions-wrap">
              {suggestions.length === 0 ? (
                <div className="groups-state-card">
                  <p>No settlement suggestions.</p>
                </div>
              ) : (
                <div className="suggestions-list">
                  {suggestions.map((item, index) => (
                    (() => {
                      const payerId = getSuggestionPayerId(item)
                      const receiverId = getSuggestionReceiverId(item)
                      const payerLabel =
                        payerId !== null
                          ? (userNames[String(payerId)] ?? item.payer?.name ?? `User ${payerId}`)
                          : (item.payer?.name ?? 'User')
                      const receiverLabel =
                        receiverId !== null
                          ? (userNames[String(receiverId)] ??
                            item.receiver?.name ??
                            `User ${receiverId}`)
                          : (item.receiver?.name ?? 'User')
                      const canSettle =
                        currentUserId !== null &&
                        payerId !== null &&
                        receiverId !== null &&
                        (currentUserId === payerId || currentUserId === receiverId)

                      return (
                        <div
                          className="suggestion-row"
                          key={`${payerId ?? 'payer'}-${receiverId ?? 'receiver'}-${item.amount}-${index}`}
                        >
                          <p className="suggestion-text">
                            {payerLabel} → {receiverLabel}:{' '}
                            {formatCurrency(item.amount)}
                          </p>

                          <button
                            className="groups-primary-btn"
                            type="button"
                            onClick={() => setSelectedSuggestion(item)}
                            disabled={!canSettle}
                          >
                            Settle
                          </button>
                        </div>
                      )
                    })()
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {activeFilter === 'expense-splits' ? (
            <section className="expense-balance-wrap">
              {expenseEntries.length === 0 ? (
                <div className="groups-state-card">
                  <p>No expenses available for split breakdown.</p>
                </div>
              ) : (
                <div className="expense-balance-list">
                  {expenseEntries.map((expense) => (
                    <article className="expense-balance-card" key={expense.id}>
                      <header className="expense-balance-header">
                        <p className="expense-balance-title">{expense.description}</p>
                        <p className="expense-balance-total">Total {formatCurrency(expense.amount)}</p>
                      </header>

                      <div className="expense-balance-splits">
                        {expense.splits.map((split) => (
                            (() => {
                              const status = getExpenseSplitStatus(expense, split)

                              return (
                                <div className="expense-balance-row" key={split.id}>
                                  <span className="expense-balance-user">{split.user.name}</span>
                                  <span className={`expense-balance-amount is-${status.tone}`}>
                                    {status.text}
                                  </span>
                                </div>
                              )
                            })()
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </>
      ) : null}

      <SettleUpModal
        open={selectedSuggestion !== null}
        onClose={() => setSelectedSuggestion(null)}
        onSettled={() => {
          setSelectedSuggestion(null)
          void fetchData()
        }}
        groupId={groupId}
        defaultPayerId={selectedSuggestion ? getSuggestionPayerId(selectedSuggestion) ?? undefined : undefined}
        defaultReceiverId={selectedSuggestion ? getSuggestionReceiverId(selectedSuggestion) ?? undefined : undefined}
        defaultAmount={selectedSuggestion?.amount}
      />
    </section>
  )
}
