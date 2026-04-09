import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { expensesApi } from '@/api'
import Skeleton from '@/components/common/Skeleton'
import type { Expense } from '@/types'
import AddExpenseModal from './AddExpenseModal'
import './expense-list.css'

interface ExpenseListProps {
  groupId: number
  currentUserId: number | null
  isGroupCreator: boolean
}

export interface ExpenseListRef {
  refetch: () => Promise<void>
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

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function getSplitStatus(expense: Expense, split: Expense['splits'][number]): {
  text: string
  tone: 'paid' | 'owed' | 'settled'
} {
  if (split.user.id === expense.paidBy.id) {
    return { text: 'paid by', tone: 'paid' }
  }

  if (split.settled) {
    return { text: 'settled', tone: 'settled' }
  }

  return { text: 'owes', tone: 'owed' }
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

  return 'Failed to load expenses.'
}

const ExpenseList = forwardRef<ExpenseListRef, ExpenseListProps>(
  ({ groupId, currentUserId, isGroupCreator }, ref) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await expensesApi.getByGroup(groupId)
      setExpenses(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useImperativeHandle(
    ref,
    () => ({
      refetch,
    }),
    [refetch],
  )

  useEffect(() => {
    void refetch()
  }, [refetch])

  const rows = useMemo(() => expenses, [expenses])

  const toggleExpanded = (expenseId: number) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(expenseId)) {
        next.delete(expenseId)
      } else {
        next.add(expenseId)
      }
      return next
    })
  }

  const handleDeleteExpense = async (expenseId: number) => {
    const confirmed = window.confirm('Delete this expense? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    setDeletingExpenseId(expenseId)
    setError(null)
    try {
      await expensesApi.deleteExpense(expenseId)
      await refetch()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingExpenseId(null)
    }
  }

  return (
    <section className="expenses-panel">
      <header className="expenses-header">
        <h3 className="expenses-title">Expenses</h3>
        <button className="groups-primary-btn" type="button" onClick={() => setIsAddExpenseOpen(true)}>
          Add expense
        </button>
      </header>

      {loading ? (
        <div className="expenses-skeleton-list" aria-label="Loading expenses">
          {[1, 2, 3, 4].map((item) => (
            <article className="expense-row expense-row-skeleton" key={item}>
              <Skeleton height="1rem" width="68%" />
              <Skeleton height="0.8rem" width="45%" />
            </article>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="groups-state-card">
          <p className="groups-error">{error}</p>
          <button className="groups-primary-btn" type="button" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error && rows.length === 0 ? (
        <div className="groups-state-card">
          <p className="expenses-empty-title">No expenses added yet.</p>
          <p className="expenses-empty-sub">Add your first expense to start tracking who owes whom in this group.</p>
        </div>
      ) : null}

      {!loading && !error && rows.length > 0 ? (
        <div className="expense-list">
          {rows.map((expense) => {
            const expanded = expandedIds.has(expense.id)
            const canDelete =
              currentUserId !== null && (isGroupCreator || expense.paidBy.id === currentUserId)
            return (
              <article key={expense.id} className="expense-item">
                <button
                  className="expense-row"
                  type="button"
                  onClick={() => toggleExpanded(expense.id)}
                  aria-expanded={expanded}
                >
                  <div className="expense-main">
                    <p className="expense-description">{expense.description}</p>
                    <div className="expense-paid-by">
                      <span className="avatar-initials">{getInitials(expense.paidBy.name)}</span>
                      <span>{expense.paidBy.name}</span>
                    </div>
                  </div>

                  <p className="expense-amount">{formatAmount(expense.amount)}</p>

                  <span className="expense-split-badge">{expense.splitType}</span>

                  <p className="expense-date">{formatDate(expense.createdAt)}</p>
                </button>

                {expanded ? (
                  <div className="expense-splits-wrap">
                    {canDelete ? (
                      <div className="expense-item-actions">
                        <button
                          type="button"
                          className="expense-delete-btn"
                          onClick={() => void handleDeleteExpense(expense.id)}
                          disabled={deletingExpenseId === expense.id}
                        >
                          {deletingExpenseId === expense.id ? 'Deleting...' : 'Delete expense'}
                        </button>
                      </div>
                    ) : null}

                    <table className="expense-splits-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Owed Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expense.splits.map((split) => {
                          const status = getSplitStatus(expense, split)

                          return (
                            <tr key={split.id}>
                              <td>{split.user.name}</td>
                              <td>{formatAmount(split.owedAmount)}</td>
                              <td>
                                <span className={`split-status split-status-${status.tone}`}>
                                  {status.text}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}

      <AddExpenseModal
        open={isAddExpenseOpen}
        groupId={groupId}
        onClose={() => setIsAddExpenseOpen(false)}
        onAdded={() => {
          void refetch()
        }}
      />
    </section>
  )
})

ExpenseList.displayName = 'ExpenseList'

export default ExpenseList
