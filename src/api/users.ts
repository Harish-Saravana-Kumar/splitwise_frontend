import client from './client'
import type { User } from '@/types'

export async function getById(userId: number): Promise<User> {
  const response = await client.get<User>(`/v1/users/${userId}`)
  return response.data
}