import client from './client'
import type { AddExpenseRequest, Expense } from '@/types'

export async function add(payload: AddExpenseRequest): Promise<Expense> {
  const response = await client.post<Expense>('/v1/expenses', payload)
  return response.data
}

export async function getById(expenseId: number): Promise<Expense> {
  const response = await client.get<Expense>(`/v1/expenses/${expenseId}`)
  return response.data
}

export async function getByGroup(groupId: number): Promise<Expense[]> {
  const response = await client.get<Expense[]>(`/v1/expenses/group/${groupId}`)
  return response.data
}

export async function deleteExpense(expenseId: number): Promise<void> {
  await client.delete(`/v1/expenses/${expenseId}`)
}
