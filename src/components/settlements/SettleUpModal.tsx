import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { settlementsApi } from '@/api'
import '@/components/groups/create-group-modal.css'
import { toastSuccess } from '@/store/toastStore'

interface SettleUpModalProps {
  open: boolean
  onClose: () => void
  onSettled: () => void
  groupId: number
  defaultPayerId?: number
  defaultReceiverId?: number
  defaultAmount?: number
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

  return 'Failed to settle up. Please try again.'
}

export default function SettleUpModal({
  open,
  onClose,
  onSettled,
  groupId,
  defaultPayerId,
  defaultReceiverId,
  defaultAmount,
}: SettleUpModalProps) {
  const [payerId, setPayerId] = useState(defaultPayerId ? String(defaultPayerId) : '')
  const [receiverId, setReceiverId] = useState(defaultReceiverId ? String(defaultReceiverId) : '')
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setPayerId(defaultPayerId ? String(defaultPayerId) : '')
      setReceiverId(defaultReceiverId ? String(defaultReceiverId) : '')
      setAmount(defaultAmount ? String(defaultAmount) : '')
      setError(null)
      setLoading(false)
    }
  }, [open, defaultPayerId, defaultReceiverId, defaultAmount])

  if (!open) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const parsedPayer = Number(payerId)
    const parsedReceiver = Number(receiverId)
    const parsedAmount = Number(amount)

    if (!Number.isInteger(parsedPayer) || parsedPayer <= 0) {
      setError('Payer ID must be a valid positive integer.')
      return
    }
    if (!Number.isInteger(parsedReceiver) || parsedReceiver <= 0) {
      setError('Receiver ID must be a valid positive integer.')
      return
    }
    if (parsedPayer === parsedReceiver) {
      setError('Payer and receiver cannot be the same user.')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a valid number greater than zero.')
      return
    }

    setLoading(true)
    try {
      await settlementsApi.settleUp({
        groupId,
        payerId: parsedPayer,
        receiverId: parsedReceiver,
        amount: parsedAmount,
      })

      toastSuccess('Settlement completed successfully.')
      onSettled()
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
        if (event.target === event.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <section className="groups-modal">
        <h2>Settle Up</h2>

        <form className="groups-form" onSubmit={handleSubmit}>
          <label className="groups-label">
            Payer ID
            <input
              className="groups-input"
              type="number"
              min={1}
              step={1}
              value={payerId}
              onChange={(event) => setPayerId(event.target.value)}
              required
            />
          </label>

          <label className="groups-label">
            Receiver ID
            <input
              className="groups-input"
              type="number"
              min={1}
              step={1}
              value={receiverId}
              onChange={(event) => setReceiverId(event.target.value)}
              required
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

          {error ? <p className="groups-error">{error}</p> : null}

          <div className="groups-modal-actions">
            <button
              type="button"
              className="groups-secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="groups-primary-btn" disabled={loading}>
              {loading ? 'Settling...' : 'Settle'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
