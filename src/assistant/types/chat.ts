export type AssistantActionType =
  | 'CREATE_EQUAL_EXPENSE_FORM'
  | 'CREATE_EQUAL_EXPENSE_SUBMIT'
  | 'SETTLE_UP_FORM'
  | 'SETTLE_UP_SUBMIT'

export interface AssistantCreateExpensePayload {
  groupId: number
  paidByUserId: number
  description: string
  amount: number
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'
}

export interface AssistantSettleUpPayload {
  groupId: number
  payerId: number
  receiverId: number
  amount: number
}

export interface AssistantChatRequest {
  conversationId?: string
  message?: string
  confirm?: boolean
  confirmationToken?: string
  actionType?: AssistantActionType
  createExpense?: AssistantCreateExpensePayload
  settleUp?: AssistantSettleUpPayload
}

export interface AssistantChatResponse {
  conversationId: string
  message: string
  requiresConfirmation: boolean
  confirmationToken: string | null
  actionType?: AssistantActionType | null
  actionData?: Record<string, unknown> | null
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}
