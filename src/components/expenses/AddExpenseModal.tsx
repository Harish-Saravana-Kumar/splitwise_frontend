import '@/components/groups/create-group-modal.css'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { expensesApi } from '@/api'
import type { AddExpenseRequest, SplitInput, SplitType } from '@/types'

interface AddExpenseModalProps {
  open: boolean
  groupId: number
  onClose: () => void
  onAdded: () => void
}

interface SplitRow {
  userId: string
  owedAmount: string
}

function toNumber(value: string): number {
  return Number(value)
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

  return 'Failed to add expense. Please try again.'
}

export default function AddExpenseModal({ open, groupId, onClose, onAdded }: AddExpenseModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidByUserId, setPaidByUserId] = useState('')
  const [splitType, setSplitType] = useState<SplitType>('EXACT')
  const [splits, setSplits] = useState<SplitRow[]>([{ userId: '', owedAmount: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsManualRows = splitType !== 'EQUAL'
  const splitValueLabel =
    splitType === 'EXACT'
      ? 'Owed Amount'
      : splitType === 'PERCENTAGE'
        ? 'Percentage'
        : 'Shares'

  if (!open) {
    return null
  }

  const handleSplitChange = (index: number, key: keyof SplitRow, value: string) => {
    setSplits((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    )
  }

  const addSplitRow = () => {
    setSplits((current) => [...current, { userId: '', owedAmount: '' }])
  }

  const removeSplitRow = (index: number) => {
    setSplits((current) => current.filter((_, rowIndex) => rowIndex !== index))
  }

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setPaidByUserId('')
    setSplitType('EXACT')
    setSplits([{ userId: '', owedAmount: '' }])
    setError(null)
    setLoading(false)
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const parsedAmount = toNumber(amount)
    const parsedPaidByUserId = toNumber(paidByUserId)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a valid number greater than zero.')
      return
    }

    if (!Number.isInteger(parsedPaidByUserId) || parsedPaidByUserId <= 0) {
      setError('Paid by user ID must be a valid positive integer.')
      return
    }

    let payloadSplits: SplitInput[] = []

    if (splitType === 'EQUAL') {
      payloadSplits = []
    } else {
      const parsedSplits = splits.map((row) => ({
        userId: toNumber(row.userId),
        owedAmount: toNumber(row.owedAmount),
      }))

      if (parsedSplits.length === 0) {
        setError('Add at least one split row for EXACT split type.')
        return
      }

      const hasInvalidRow = parsedSplits.some(
        (row) =>
          !Number.isInteger(row.userId) ||
          row.userId <= 0 ||
          !Number.isFinite(row.owedAmount) ||
          row.owedAmount <= 0,
      )
      if (hasInvalidRow) {
        setError('Each split row needs a valid user ID and owed amount.')
        return
      }

      const sum = parsedSplits.reduce((total, row) => total + row.owedAmount, 0)
      if (Math.abs(sum - parsedAmount) > 0.0001) {
        if (splitType === 'EXACT') {
          setError('For EXACT split, sum of owed amounts must equal total amount.')
          return
        }
      }

      if (splitType === 'PERCENTAGE' && Math.abs(sum - 100) > 0.0001) {
        setError('For PERCENTAGE split, total percentage must be 100.')
        return
      }

      payloadSplits = parsedSplits
    }

    const payload: AddExpenseRequest = {
      groupId,
      paidByUserId: parsedPaidByUserId,
      description: description.trim(),
      amount: parsedAmount,
      splitType,
      splits: payloadSplits,
    }

    setLoading(true)
    try {
      await expensesApi.add(payload)
      onAdded()
      resetForm()
      onClose()
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
      <section className="groups-modal expense-modal">
        <h2>Add Expense</h2>

        <form className="groups-form expense-form" onSubmit={handleSubmit}>
          <label className="groups-label">
            Description
            <input
              className="groups-input"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={200}
            />
          </label>

          <label className="groups-label">
            Amount
            <input
              className="groups-input"
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

          <label className="groups-label">
            Paid By User ID
            <input
              className="groups-input"
              type="number"
              min={1}
              step={1}
              value={paidByUserId}
              onChange={(event) => setPaidByUserId(event.target.value)}
              required
            />
          </label>

          <label className="groups-label">
            Split Type
            <select
              className="groups-input"
              value={splitType}
              onChange={(event) => setSplitType(event.target.value as SplitType)}
            >
              <option value="EQUAL">EQUAL</option>
              <option value="EXACT">EXACT</option>
              <option value="PERCENTAGE">PERCENTAGE</option>
              <option value="SHARES">SHARES</option>
            </select>
          </label>

          {splitType === 'EQUAL' ? (
            <div className="exact-splits-wrap">
              <p className="exact-splits-title">Equal Split</p>
              <p className="groups-success">
                Amount will be split equally across all current group members.
              </p>
            </div>
          ) : null}

          {needsManualRows ? (
            <div className="exact-splits-wrap">
              <p className="exact-splits-title">Splits ({splitType})</p>

              {splits.map((row, index) => (
                <div className="exact-split-row" key={`${index}-${row.userId}-${row.owedAmount}`}>
                  <input
                    className="groups-input"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="User ID"
                    value={row.userId}
                    onChange={(event) => handleSplitChange(index, 'userId', event.target.value)}
                    required
                  />

                  <input
                    className="groups-input"
                    type="number"
                    min={0.01}
                    step="0.01"
                    placeholder={splitValueLabel}
                    value={row.owedAmount}
                    onChange={(event) => handleSplitChange(index, 'owedAmount', event.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="groups-secondary-btn"
                    onClick={() => removeSplitRow(index)}
                    disabled={splits.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button type="button" className="groups-secondary-btn" onClick={addSplitRow}>
                + Add split row
              </button>
            </div>
          ) : null}

          {error ? <p className="groups-error">{error}</p> : null}

          <div className="groups-modal-actions">
            <button type="button" className="groups-secondary-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="groups-primary-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Add expense'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
