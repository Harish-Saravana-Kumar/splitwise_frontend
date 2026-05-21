import client from './client'
import type {
  AuthResponse,
  GoogleAuthRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/types'

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/register', payload)
  return response.data
}

export async function googleLogin(payload: GoogleAuthRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/google', payload)
  return response.data
}

export async function forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
  await client.post('/auth/forgot-password', payload)
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  await client.post('/auth/reset-password', payload)
}
