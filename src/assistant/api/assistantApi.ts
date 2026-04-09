import client from '@/api/client'
import type { AssistantChatRequest, AssistantChatResponse } from '@/assistant/types/chat'

export async function sendAssistantMessage(
  payload: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  const response = await client.post<AssistantChatResponse>('/v1/assistant/chat', payload)
  return response.data
}
