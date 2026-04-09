import { useEffect, useMemo, useRef, useState } from 'react'
import CreateExpenseAssistantForm from '@/assistant/components/CreateExpenseAssistantForm'
import SettleUpAssistantForm from '@/assistant/components/SettleUpAssistantForm'
import { sendAssistantMessage } from '@/assistant/api/assistantApi'
import type {
  AssistantCreateExpensePayload,
  AssistantMessage,
  AssistantSettleUpPayload,
} from '@/assistant/types/chat'
import { toastError, toastSuccess } from '@/store/toastStore'
import './assistant-page.css'

function toMessage(role: AssistantMessage['role'], content: string): AssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data &&
    typeof (error as { response?: { data?: { error?: unknown } } }).response?.data?.error === 'string'
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message
  }

  return 'Assistant request failed.'
}

export default function AssistantPage() {
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [messages, setMessages] = useState<AssistantMessage[]>([
    toMessage(
      'assistant',
      'Ask me about totals, group balances, recent expenses, or who owes whom. I can prepare guided expense and settle up actions for your confirmation.',
    ),
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingConfirmationToken, setPendingConfirmationToken] = useState<string | null>(null)
  const [showCreateExpenseForm, setShowCreateExpenseForm] = useState(false)
  const [showSettleUpForm, setShowSettleUpForm] = useState(false)
  const chatRef = useRef<HTMLElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  useEffect(() => {
    if (!chatRef.current) {
      return
    }
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const submitPrompt = async () => {
    const text = input.trim()
    if (!text || loading) {
      return
    }

    setMessages((prev) => [...prev, toMessage('user', text)])
    setInput('')
    setLoading(true)

    try {
      const response = await sendAssistantMessage({
        conversationId,
        message: text,
      })

      setConversationId(response.conversationId)
      setMessages((prev) => [...prev, toMessage('assistant', response.message)])
      setShowCreateExpenseForm(response.actionType === 'CREATE_EQUAL_EXPENSE_FORM')
      setShowSettleUpForm(response.actionType === 'SETTLE_UP_FORM')

      const matchedToken = response.message.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/,
      )
      if (response.requiresConfirmation && response.confirmationToken) {
        setPendingConfirmationToken(response.confirmationToken)
        setShowCreateExpenseForm(false)
        setShowSettleUpForm(false)
      } else {
        setPendingConfirmationToken(matchedToken ? matchedToken[0] : null)
      }
    } catch (error) {
      toastError(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const confirmPendingAction = async () => {
    if (!pendingConfirmationToken || loading) {
      return
    }

    setLoading(true)
    try {
      const response = await sendAssistantMessage({
        conversationId,
        confirm: true,
        confirmationToken: pendingConfirmationToken,
      })
      setConversationId(response.conversationId)
      setMessages((prev) => [
        ...prev,
        toMessage('user', `Confirm action ${pendingConfirmationToken}`),
        toMessage('assistant', response.message),
      ])
      setPendingConfirmationToken(null)
      toastSuccess('Assistant action confirmed.')
    } catch (error) {
      toastError(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const submitCreateExpenseForm = async (payload: AssistantCreateExpensePayload) => {
    if (loading) {
      return
    }

    setLoading(true)
    try {
      const response = await sendAssistantMessage({
        conversationId,
        actionType: 'CREATE_EQUAL_EXPENSE_SUBMIT',
        createExpense: payload,
      })
      setConversationId(response.conversationId)
      setMessages((prev) => [
        ...prev,
        toMessage('user', `Create expense: ${payload.description} (${payload.amount})`),
        toMessage('assistant', response.message),
      ])
      setPendingConfirmationToken(response.confirmationToken)
      setShowCreateExpenseForm(false)
    } catch (error) {
      toastError(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const submitSettleUpForm = async (payload: AssistantSettleUpPayload) => {
    if (loading) {
      return
    }

    setLoading(true)
    try {
      const response = await sendAssistantMessage({
        conversationId,
        actionType: 'SETTLE_UP_SUBMIT',
        settleUp: payload,
      })
      setConversationId(response.conversationId)
      setMessages((prev) => [
        ...prev,
        toMessage('user', `Settle up request (${payload.amount}) submitted`),
        toMessage('assistant', response.message),
      ])
      setPendingConfirmationToken(response.confirmationToken)
      setShowSettleUpForm(false)
    } catch (error) {
      toastError(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="assistant-page">
      <header className="assistant-header">
        <h1>Splitwise Assistant</h1>
        <p>AI-powered assistant for expense questions and guided actions.</p>
      </header>

      <section className="assistant-chat" aria-label="Assistant conversation" ref={chatRef}>
        {messages.map((message) => (
          <article
            key={message.id}
            className={`assistant-msg ${message.role === 'user' ? 'assistant-msg-user' : ''}`}
          >
            <p className="assistant-msg-role">{message.role === 'user' ? 'You' : 'Assistant'}</p>
            <p className="assistant-msg-content">{message.content}</p>
          </article>
        ))}
      </section>

      <section className="assistant-composer">
        {pendingConfirmationToken ? (
          <div className="assistant-confirm">
            <p>
              A write action is pending confirmation.
              <br />
              <strong>Token:</strong> {pendingConfirmationToken}
            </p>
            <button
              type="button"
              className="groups-primary-btn"
              disabled={loading}
              onClick={() => void confirmPendingAction()}
            >
              {loading ? 'Confirming...' : 'Confirm pending action'}
            </button>
          </div>
        ) : null}

        {showCreateExpenseForm ? (
          <CreateExpenseAssistantForm
            open={showCreateExpenseForm}
            disabled={loading}
            onCancel={() => setShowCreateExpenseForm(false)}
            onSubmit={submitCreateExpenseForm}
          />
        ) : null}

        {showSettleUpForm ? (
          <SettleUpAssistantForm
            open={showSettleUpForm}
            disabled={loading}
            onCancel={() => setShowSettleUpForm(false)}
            onSubmit={submitSettleUpForm}
          />
        ) : null}

        <textarea
          className="assistant-input"
          placeholder="Ask: How much do I owe? Show my recent expenses. Prepare an expense in group 3..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void submitPrompt()
            }
          }}
          disabled={loading}
        />

        <div className="assistant-actions">
          <p className="assistant-hint">
            For write actions, the assistant returns a token and waits for your confirmation.
          </p>
          <button
            type="button"
            className="groups-primary-btn"
            disabled={!canSend}
            onClick={() => void submitPrompt()}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </section>
    </main>
  )
}