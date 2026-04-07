export interface AuthResponse {
  token: string
  userId: number
  name: string
  email: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  avatarUrl: null
}

export interface User {
  id: number
  name: string
  email: string
  avatarUrl: string | null
}

export interface Group {
  id: number
  name: string
  description: string
  createdBy: User
  createdAt: string
}

export interface CreateGroupRequest {
  name: string
  description: string
}

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'

export interface SplitInput {
  userId: number
  owedAmount: number
}

export interface AddExpenseRequest {
  groupId: number
  paidByUserId: number
  description: string
  amount: number
  splitType: SplitType
  splits: SplitInput[]
}

export interface ExpenseSplit {
  id: number
  user: User
  owedAmount: number
  settled: boolean
}

export interface Expense {
  id: number
  groupId: number
  paidBy: User
  description: string
  amount: number
  splitType: SplitType
  splits: ExpenseSplit[]
  createdAt: string
}

export interface SettleUpRequest {
  groupId: number
  payerId: number
  receiverId: number
  amount: number
}

export interface Settlement {
  id: number
  groupId: number
  payer: User
  receiver: User
  amount: number
  settledAt: string
}

export type GroupBalances = Record<string, number>

export interface SettlementSuggestion {
  payerId?: number
  receiverId?: number
  payer?: User
  receiver?: User
  amount: number
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ApiError {
  message: string
  status?: number
}

export interface DashboardGroupSummary {
  groupId: number
  groupName: string
  totalExpense: number
  userNetBalance: number
}

export interface DashboardPersonBalance {
  userId: number
  userName: string
  netAmount: number
}

export interface DashboardResponse {
  totalPaid: number
  totalOwes: number
  groupSummaries: DashboardGroupSummary[]
  personBalances: DashboardPersonBalance[]
}