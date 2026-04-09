import { useEffect, useMemo, useRef, useState } from 'react'
import { sendAssistantMessage } from '@/assistant/api/assistantApi'
import CreateExpenseAssistantForm from '@/assistant/components/CreateExpenseAssistantForm'
import SettleUpAssistantForm from '@/assistant/components/SettleUpAssistantForm'
import type {
  AssistantCreateExpensePayload,
  AssistantMessage,
  AssistantSettleUpPayload,
} from '@/assistant/types/chat'
import './assistant-widget.css'

const CONVERSATION_STORAGE_KEY = 'assistant_widget_conversation_id'

function toMessage(role: AssistantMessage['role'], content: string): AssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

const SERVICES_TEXT =
  'Hi! I can help with Splitwise Assistant services:\n' +
  '1) Explain assistant features and usage\n' +
  '2) Check balances, dues, and recent expenses\n' +
  '3) Prepare expense actions and confirmation flow\n' +
  '4) Prepare settle up actions and confirmation flow'

const OUT_OF_SCOPE_TEXT =
  'I can only answer questions about the Splitwise Assistant and its supported finance actions. Ask about balances, expenses, confirmations, sessions, or assistant setup.'

const BACKEND_OFFLINE_TEXT =
  'Assistant backend is not reachable right now. Please ensure backend is running, then try again.'

const FEATURE_HELP_TEXT =
  'I can help with: balances/dues, recent expenses, guided create-expense, guided settle-up, and previous question from saved chat history.'

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

  if (error instanceof Error && /rate limit|rate_limit_exceeded|tokens per minute|tpm/i.test(error.message)) {
    return 'Assistant is temporarily rate-limited. Please retry in a few seconds.'
  }

  return BACKEND_OFFLINE_TEXT
}

function isGreeting(text: string): boolean {
  return /^(hi|hello|hey|yo|hola)\b/i.test(text.trim())
}

function isAssistantScoped(text: string): boolean {
  const assistantScope =
    /assistant|splitwise|group|expense|balance|dues|due|owe|owed|settle|settlement|confirm|token|conversation|chat|history|backend|api|last|previous|yesterday|about me|tell about me|my profile|profile|about myself|who am i/i
  return assistantScope.test(text)
}

function mapServiceMenuChoice(text: string): string | null {
  const normalized = text.trim()
  if (normalized === '1') {
    return 'Explain assistant features and usage'
  }
  if (normalized === '2') {
    return 'Check balances, dues, and recent expenses'
  }
  if (normalized === '3') {
    return 'Create expense'
  }
  if (normalized === '4') {
    return 'Settle up'
  }
  return null
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(() => {
    const saved = window.localStorage.getItem(CONVERSATION_STORAGE_KEY)
    return saved && saved.trim().length > 0 ? saved : undefined
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingConfirmationToken, setPendingConfirmationToken] = useState<string | null>(null)
  const [showCreateExpenseForm, setShowCreateExpenseForm] = useState(false)
  const [showSettleUpForm, setShowSettleUpForm] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([
    toMessage('assistant', 'Hi. I am your Splitwise Assistant helper. Send "hi" to view services.'),
  ])
  const messagesRef = useRef<HTMLDivElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  useEffect(() => {
    if (!open || !messagesRef.current) {
      return
    }
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, open])

  const openWidget = () => {
    setOpen(true)
  }

  const submitPrompt = async () => {
    const text = input.trim()
    if (!text || loading) {
      return
    }

    const mappedChoice = mapServiceMenuChoice(text)
    const effectiveText = mappedChoice ?? text

    setInput('')
    setMessages((prev) => [...prev, toMessage('user', text)])

    if (isGreeting(text)) {
      setMessages((prev) => [...prev, toMessage('assistant', SERVICES_TEXT)])
      return
    }

    if (effectiveText === 'Explain assistant features and usage') {
      setMessages((prev) => [...prev, toMessage('assistant', FEATURE_HELP_TEXT)])
      return
    }

    if (!isAssistantScoped(effectiveText)) {
      setMessages((prev) => [...prev, toMessage('assistant', OUT_OF_SCOPE_TEXT)])
      return
    }

    setLoading(true)
    try {
      const response = await sendAssistantMessage({
        conversationId,
        message: effectiveText,
      })

      setConversationId(response.conversationId)
      window.localStorage.setItem(CONVERSATION_STORAGE_KEY, response.conversationId)
      setMessages((prev) => [...prev, toMessage('assistant', response.message)])
      setShowCreateExpenseForm(response.actionType === 'CREATE_EQUAL_EXPENSE_FORM')
      setShowSettleUpForm(response.actionType === 'SETTLE_UP_FORM')

      if (response.requiresConfirmation && response.confirmationToken) {
        setPendingConfirmationToken(response.confirmationToken)
        setShowCreateExpenseForm(false)
        setShowSettleUpForm(false)
      } else {
        setPendingConfirmationToken(null)
      }
    } catch (error) {
      setMessages((prev) => [...prev, toMessage('assistant', getApiErrorMessage(error))])
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
      window.localStorage.setItem(CONVERSATION_STORAGE_KEY, response.conversationId)
      setMessages((prev) => [
        ...prev,
        toMessage('user', `Confirm action ${pendingConfirmationToken}`),
        toMessage('assistant', response.message),
      ])
      setPendingConfirmationToken(null)
    } catch (error) {
      setMessages((prev) => [...prev, toMessage('assistant', getApiErrorMessage(error))])
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
      window.localStorage.setItem(CONVERSATION_STORAGE_KEY, response.conversationId)
      setMessages((prev) => [
        ...prev,
        toMessage('user', `Create expense: ${payload.description} (${payload.amount})`),
        toMessage('assistant', response.message),
      ])

      setPendingConfirmationToken(response.confirmationToken)
      setShowCreateExpenseForm(false)
    } catch (error) {
      setMessages((prev) => [...prev, toMessage('assistant', getApiErrorMessage(error))])
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
      window.localStorage.setItem(CONVERSATION_STORAGE_KEY, response.conversationId)
      setMessages((prev) => [
        ...prev,
        toMessage('user', `Settle up request (${payload.amount}) submitted`),
        toMessage('assistant', response.message),
      ])

      setPendingConfirmationToken(response.confirmationToken)
      setShowSettleUpForm(false)
    } catch (error) {
      setMessages((prev) => [...prev, toMessage('assistant', getApiErrorMessage(error))])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="assistant-widget-root" aria-live="polite">
      {open ? (
        <section className="assistant-widget-panel" aria-label="Assistant widget">
          <button
            type="button"
            className="assistant-widget-close"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
          >
            x
          </button>

          <div className="assistant-widget-messages" ref={messagesRef}>
            {messages.map((message) => (
              <article
                key={message.id}
                className={`assistant-widget-msg ${message.role === 'user' ? 'assistant-widget-msg-user' : ''}`}
              >
                <p className="assistant-widget-msg-content">{message.content}</p>
              </article>
            ))}
          </div>

          {pendingConfirmationToken ? (
            <div className="assistant-widget-confirm">
              <p>Pending confirmation token ready.</p>
              <button
                type="button"
                className="groups-primary-btn"
                disabled={loading}
                onClick={() => void confirmPendingAction()}
              >
                {loading ? 'Confirming...' : 'Confirm action'}
              </button>
            </div>
          ) : null}

          {showCreateExpenseForm ? (
            <CreateExpenseAssistantForm
              open={showCreateExpenseForm}
              disabled={loading}
              onCancel={() => {
                setShowCreateExpenseForm(false)
              }}
              onSubmit={submitCreateExpenseForm}
            />
          ) : null}

          {showSettleUpForm ? (
            <SettleUpAssistantForm
              open={showSettleUpForm}
              disabled={loading}
              onCancel={() => {
                setShowSettleUpForm(false)
              }}
              onSubmit={submitSettleUpForm}
            />
          ) : null}

          <div className="assistant-widget-composer">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void submitPrompt()
                }
              }}
              disabled={loading}
              placeholder="Ask about assistant usage, balances, expenses, and confirmations..."
            />
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
      ) : null}

      {!open ? (
        <button
          type="button"
          className="assistant-widget-trigger"
          onClick={openWidget}
          aria-label="Open assistant chat"
        >
          Ask Assistant
        </button>
      ) : null}
    </div>
  )
}
