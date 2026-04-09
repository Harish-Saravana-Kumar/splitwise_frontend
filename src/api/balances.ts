import client from './client'
import type { GroupBalances, SettlementBalanceResponse, SettlementSuggestion } from '@/types'

export async function getGroupBalances(groupId: number): Promise<GroupBalances> {
  const response = await client.get<GroupBalances>(`/v1/balances/group/${groupId}`)
  return response.data
}

export async function getSettlementSuggestions(
  groupId: number,
): Promise<SettlementSuggestion[]> {
  const response = await client.get<SettlementSuggestion[]>(
    `/v1/balances/group/${groupId}/settlements`,
  )
  return response.data
}

export async function getPendingSettlementBetween(
  groupId: number,
  payerId: number,
  receiverId: number,
): Promise<SettlementBalanceResponse> {
  const response = await client.get<SettlementBalanceResponse>(
    `/v1/balances/group/${groupId}/pending`,
    {
      params: { payerId, receiverId },
    },
  )
  return response.data
}
