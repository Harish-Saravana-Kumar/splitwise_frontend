import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { groupsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import type { Group, User } from '@/types'
import type { AssistantCreateExpensePayload } from '@/assistant/types/chat'
import './create-expense-assistant-form.css'

interface CreateExpenseAssistantFormProps {
  open: boolean
  disabled?: boolean
  onCancel: () => void
  onSubmit: (payload: AssistantCreateExpensePayload) => Promise<void>
}

export default function CreateExpenseAssistantForm({
  open,
  disabled = false,
  onCancel,
  onSubmit,
}: CreateExpenseAssistantFormProps) {
  const userId = useAuthStore((state) => state.userId)

  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [optionsError, setOptionsError] = useState<string | null>(null)

  const [groupId, setGroupId] = useState<string>('')
  const [paidByUserId, setPaidByUserId] = useState<string>('')
  const [splitType, setSplitType] = useState<'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'>('EQUAL')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
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
      setPaidByUserId('')
      return
    }

    setLoadingOptions(true)
    setOptionsError(null)

    void groupsApi
      .getMembers(selectedGroupId)
      .then((rows) => {
        setMembers(rows)
        if (rows.length > 0) {
          setPaidByUserId(String(rows[0].id))
        } else {
          setPaidByUserId('')
        }
      })
      .catch(() => {
        setMembers([])
        setPaidByUserId('')
        setOptionsError('Unable to load group members. Please retry.')
      })
      .finally(() => {
        setLoadingOptions(false)
      })
  }, [open, groupId])

  const canSubmit = useMemo(() => {
    return (
      !disabled &&
      !loadingOptions &&
      groupId.trim().length > 0 &&
      paidByUserId.trim().length > 0 &&
      splitType.trim().length > 0 &&
      description.trim().length > 0 &&
      amount.trim().length > 0
    )
  }, [amount, description, disabled, groupId, loadingOptions, paidByUserId, splitType])

  if (!open) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsedGroupId = Number(groupId)
    const parsedPayerId = Number(paidByUserId)
    const parsedAmount = Number(amount)

    if (!Number.isInteger(parsedGroupId) || parsedGroupId <= 0) {
      setFormError('Please select a valid group.')
      return
    }

    if (!Number.isInteger(parsedPayerId) || parsedPayerId <= 0) {
      setFormError('Please select who paid.')
      return
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Amount must be greater than 0.')
      return
    }

    await onSubmit({
      groupId: parsedGroupId,
      paidByUserId: parsedPayerId,
      description: description.trim(),
      amount: parsedAmount,
      splitType,
    })
  }

  return (
    <section className="assistant-create-expense" aria-label="Create expense form">
      <h3>Create Expense</h3>
      <p>This creates an EQUAL split expense draft and asks for your confirmation.</p>

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
          Paid by
          <select
            value={paidByUserId}
            onChange={(event) => setPaidByUserId(event.target.value)}
            disabled={disabled || loadingOptions}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Split type
          <select
            value={splitType}
            onChange={(event) => setSplitType(event.target.value as 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES')}
            disabled={disabled}
          >
            <option value="EQUAL">EQUAL</option>
            <option value="EXACT">EXACT</option>
            <option value="PERCENTAGE">PERCENTAGE</option>
            <option value="SHARES">SHARES</option>
          </select>
        </label>

        {splitType !== 'EQUAL' ? (
          <p className="groups-error">Assistant guided mode currently supports EQUAL split only.</p>
        ) : null}

        <label>
          Description
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g., Team dinner"
            maxLength={200}
            disabled={disabled}
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            min={0.01}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="e.g., 1500"
            disabled={disabled}
          />
        </label>

        {formError ? <p className="groups-error">{formError}</p> : null}

        <div className="assistant-create-expense-actions">
          <button type="button" className="groups-secondary-btn" onClick={onCancel} disabled={disabled}>
            Cancel
          </button>
          <button type="submit" className="groups-primary-btn" disabled={!canSubmit}>
            {disabled ? 'Preparing...' : 'Prepare expense'}
          </button>
        </div>
      </form>
    </section>
  )
}
