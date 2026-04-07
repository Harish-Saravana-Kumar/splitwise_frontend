import client from './client'
import type { SettleUpRequest, Settlement } from '@/types'

export async function settleUp(payload: SettleUpRequest): Promise<Settlement> {
  const response = await client.post<Settlement>('/v1/settlements', payload)
  return response.data
}

export async function getByGroup(groupId: number): Promise<Settlement[]> {
  const response = await client.get<Settlement[]>(`/v1/settlements/group/${groupId}`)
  return response.data
}
