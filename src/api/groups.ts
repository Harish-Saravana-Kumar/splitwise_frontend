import client from './client'
import type { CreateGroupRequest, Group, GroupInvitation, InviteMemberRequest, User } from '@/types'

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

export async function inviteMember(groupId: number, payload: InviteMemberRequest): Promise<GroupInvitation> {
  const response = await client.post<{ data: GroupInvitation }>(`/v1/groups/${groupId}/invite`, payload)
  return response.data.data
}

export async function getMembers(groupId: number): Promise<User[]> {
  const response = await client.get<{ data: User[] }>(`/v1/groups/${groupId}/members`)
  return response.data.data
}

export async function getPendingInvitations(): Promise<GroupInvitation[]> {
  const response = await client.get<{ data: GroupInvitation[] }>('/v1/groups/invitations')
  return response.data.data
}

export async function acceptInvitation(requestId: number): Promise<GroupInvitation> {
  const response = await client.post<{ data: GroupInvitation }>(`/v1/groups/invitations/${requestId}/accept`)
  return response.data.data
}

export async function rejectInvitation(requestId: number): Promise<GroupInvitation> {
  const response = await client.post<{ data: GroupInvitation }>(`/v1/groups/invitations/${requestId}/reject`)
  return response.data.data
}

export async function deleteGroup(groupId: number, requesterUserId: number): Promise<void> {
  await client.delete(`/v1/groups/${groupId}`, {
    params: { requesterUserId },
  })
}

export async function leaveGroup(groupId: number): Promise<void> {
  await client.post(`/v1/groups/${groupId}/leave`)
}

export async function removeMember(groupId: number, memberId: number): Promise<void> {
  await client.delete(`/v1/groups/${groupId}/members/${memberId}`)
}
