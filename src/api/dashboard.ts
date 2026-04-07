import client from './client'
import type { DashboardResponse } from '@/types'

export async function getMyDashboard(): Promise<DashboardResponse> {
  const response = await client.get<DashboardResponse>('/v1/dashboard/me')
  return response.data
}
