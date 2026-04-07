import client from './client'
import type { CreateGroupRequest, Group, User } from '@/types'

export async function getById(groupId: number): Promise<Group> {
  const response = await client.get<Group>(`/v1/groups/${groupId}`)
  return response.data
}

export async function getByUser(userId: number): Promise<Group[]> {
  const response = await client.get<Group[]>('/v1/users/groups', {
    params: { userId },
  })
  return response.data
}

export async function create(
  creatorUserId: number,
  payload: CreateGroupRequest,
): Promise<Group> {
  const response = await client.post<Group>('/v1/users/groups', payload, {
    params: { creatorUserId },
  })
  return response.data
}

export async function addMember(groupId: number, userId: number): Promise<Group> {
  const response = await client.post<Group>(`/v1/groups/${groupId}/members`, null, {
    params: { userId },
  })
  return response.data
}

export async function getMembers(groupId: number): Promise<User[]> {
  const response = await client.get<User[]>(`/v1/groups/${groupId}/members`)
  return response.data
}

export async function deleteGroup(groupId: number, requesterUserId: number): Promise<void> {
  await client.delete(`/v1/groups/${groupId}`, {
    params: { requesterUserId },
  })
}
