import client from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/register', payload)
  return response.data
}

export async function forgotPassword(payload: {
  email: string
  newPassword: string
}): Promise<void> {
  await client.post('/auth/forgot-password', payload)
}
