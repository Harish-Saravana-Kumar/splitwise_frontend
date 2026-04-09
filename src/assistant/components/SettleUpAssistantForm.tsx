import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { balancesApi, groupsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { Group, User } from '@/types'
import type { AssistantSettleUpPayload } from '@/assistant/types/chat'
import './create-expense-assistant-form.css'

interface SettleUpAssistantFormProps {
  open: boolean
  disabled?: boolean
  onCancel: () => void
  onSubmit: (payload: AssistantSettleUpPayload) => Promise<void>
}

export default function SettleUpAssistantForm({
  open,
  disabled = false,
  onCancel,
  onSubmit,
}: SettleUpAssistantFormProps) {
  const userId = useAuthStore((state) => state.userId)

  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [optionsError, setOptionsError] = useState<string | null>(null)

  const [groupId, setGroupId] = useState<string>('')
  const [payerId, setPayerId] = useState<string>('')
  const [receiverId, setReceiverId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [pendingAmount, setPendingAmount] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || userId === null) {
      return
    }

    setLoadingOptions(true)
    setOptionsError(null)

    void groupsApi
      .getByUser(userId)
      .then((rows) => {
        setGroups(rows)
        if (rows.length > 0) {
          setGroupId(String(rows[0].id))
        }
      })
      .catch(() => {
        setOptionsError('Unable to load your groups. Please retry.')
      })
      .finally(() => {
        setLoadingOptions(false)
      })
  }, [open, userId])

  useEffect(() => {
    const selectedGroupId = Number(groupId)
    if (!open || !Number.isInteger(selectedGroupId) || selectedGroupId <= 0) {
      setMembers([])
      setPayerId('')
      setReceiverId('')
      setPendingAmount(null)
      setAmount('')
      return
    }

    setLoadingOptions(true)
    setOptionsError(null)

    void Promise.all([groupsApi.getMembers(selectedGroupId), balancesApi.getGroupBalances(selectedGroupId)])
      .then(([rows, groupBalances]) => {
        setMembers(rows)
        setBalances(groupBalances)

        const positiveMembers = rows.filter((member) => (groupBalances[String(member.id)] ?? 0) > 0)
        const negativeMembers = rows.filter((member) => (groupBalances[String(member.id)] ?? 0) < 0)

        if (negativeMembers.length > 0) {
          setPayerId(String(negativeMembers[0].id))
        } else if (rows.length > 0) {
          setPayerId(String(rows[0].id))
        } else {
          setPayerId('')
        }

        if (positiveMembers.length > 0) {
          setReceiverId(String(positiveMembers[0].id))
        } else if (rows.length > 1) {
          setReceiverId(String(rows[1].id))
        } else if (rows.length > 0) {
          setReceiverId(String(rows[0].id))
        } else {
          setReceiverId('')
        }
      })
      .catch(() => {
        setMembers([])
        setBalances({})
        setPayerId('')
        setReceiverId('')
        setOptionsError('Unable to load group balances. Please retry.')
      })
      .finally(() => {
        setLoadingOptions(false)
      })
  }, [open, groupId])

  useEffect(() => {
    const selectedGroupId = Number(groupId)
    const selectedPayerId = Number(payerId)
    const selectedReceiverId = Number(receiverId)

    if (
      !open ||
      !Number.isInteger(selectedGroupId) ||
      selectedGroupId <= 0 ||
      !Number.isInteger(selectedPayerId) ||
      selectedPayerId <= 0 ||
      !Number.isInteger(selectedReceiverId) ||
      selectedReceiverId <= 0 ||
      selectedPayerId === selectedReceiverId
    ) {
      setPendingAmount(null)
      setAmount('')
      return
    }

    setLoadingOptions(true)
    setOptionsError(null)

    void balancesApi
      .getPendingSettlementBetween(selectedGroupId, selectedPayerId, selectedReceiverId)
      .then((row) => {
        setPendingAmount(row.amount)
        setAmount(row.amount.toFixed(2))
      })
      .catch(() => {
        setPendingAmount(null)
        setAmount('')
        setOptionsError('Unable to load the exact settlement amount for this payer and receiver.')
      })
      .finally(() => {
        setLoadingOptions(false)
      })
  }, [open, groupId, payerId, receiverId])

  const canSubmit = useMemo(() => {
    return (
      !disabled &&
      !loadingOptions &&
      groupId.trim().length > 0 &&
      payerId.trim().length > 0 &&
      receiverId.trim().length > 0 &&
      amount.trim().length > 0 &&
      pendingAmount !== null
    )
  }, [amount, disabled, groupId, loadingOptions, payerId, pendingAmount, receiverId])

  const payerOptions = useMemo(() => {
    const debtors = members.filter((member) => (balances[String(member.id)] ?? 0) < 0)
    return debtors.length > 0 ? debtors : members
  }, [balances, members])

  const receiverOptions = useMemo(() => {
    const lenders = members.filter((member) => (balances[String(member.id)] ?? 0) > 0)
    return lenders.length > 0 ? lenders : members
  }, [balances, members])

  const renderBalanceLabel = (member: User) => {
    const balance = balances[String(member.id)] ?? 0
    const prefix = balance > 0 ? '+' : balance < 0 ? '-' : ''
    return `${member.name} (${prefix}₹${Math.abs(balance).toFixed(2)})`
  }

  if (!open) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsedGroupId = Number(groupId)
    const parsedPayerId = Number(payerId)
    const parsedReceiverId = Number(receiverId)
    const parsedAmount = Number(amount)

    if (!Number.isInteger(parsedGroupId) || parsedGroupId <= 0) {
      setFormError('Please select a valid group.')
      return
    }
    if (!Number.isInteger(parsedPayerId) || parsedPayerId <= 0) {
      setFormError('Please select a valid payer.')
      return
    }
    if (!Number.isInteger(parsedReceiverId) || parsedReceiverId <= 0) {
      setFormError('Please select a valid receiver.')
      return
    }
    if (parsedPayerId === parsedReceiverId) {
      setFormError('Payer and receiver cannot be the same person.')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Amount must be greater than 0.')
      return
    }
    if (pendingAmount !== null && parsedAmount > pendingAmount) {
      setFormError(`Amount cannot exceed the current pending balance of ₹${pendingAmount.toFixed(2)}.`)
      return
    }

    if (userId === null || (userId !== parsedPayerId && userId !== parsedReceiverId)) {
      setFormError('Only the expense payer or the owed person can settle up.')
      return
    }

    await onSubmit({
      groupId: parsedGroupId,
      payerId: parsedPayerId,
      receiverId: parsedReceiverId,
      amount: parsedAmount,
    })
  }

  return (
    <section className="assistant-create-expense" aria-label="Settle up form">
      <h3>Settle Up</h3>
      <p>This prepares a settlement draft and asks for your confirmation.</p>

      {optionsError ? <p className="groups-error">{optionsError}</p> : null}

      <form className="assistant-create-expense-form" onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Group
          <select
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            disabled={disabled || loadingOptions}
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Payer owes money
          <select
            value={payerId}
            onChange={(event) => setPayerId(event.target.value)}
            disabled={disabled || loadingOptions}
          >
            {payerOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {renderBalanceLabel(member)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Receiver is owed money
          <select
            value={receiverId}
            onChange={(event) => setReceiverId(event.target.value)}
            disabled={disabled || loadingOptions}
          >
            {receiverOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {renderBalanceLabel(member)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Amount to pay
          <input
            type="number"
            min={0.01}
            max={pendingAmount ?? undefined}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount to settle"
            disabled={disabled || loadingOptions}
          />
        </label>

        <p className="assistant-form-hint">
          You can pay any amount up to the current pending balance. Partial payments will reduce the remaining owes.
        </p>

        {formError ? <p className="groups-error">{formError}</p> : null}

        <div className="assistant-create-expense-actions">
          <button type="button" className="groups-secondary-btn" onClick={onCancel} disabled={disabled}>
            Cancel
          </button>
          <button type="submit" className="groups-primary-btn" disabled={!canSubmit}>
            {disabled ? 'Preparing...' : 'Prepare settlement'}
          </button>
        </div>
      </form>
    </section>
  )
}
