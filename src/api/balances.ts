import client from './client'
import type { GroupBalances, SettlementSuggestion } from '@/types'

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
