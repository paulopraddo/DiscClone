export interface AuthResponse {
  userId: string
  username: string
  token: string
}

export interface RegisterResponse {
  userId: string
  email: string
}

export interface ChannelSummary {
  id: string
  name: string
  type: 'text' | 'voice'
}

export interface MessageSummary {
  id: string
  authorId: string
  authorUsername: string
  content: string
  sentAt: string
}

export interface ServerSummary {
  id: string
  name: string
  channels: ChannelSummary[]
}

let authToken: string | null = null

export function setApiAuthToken(token: string | null): void {
  authToken = token
}

async function request<T>(path: string, options: { method: string; body?: unknown }): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = Array.isArray(data) ? data.join(' ') : 'Falha na requisição.'
    throw new Error(message)
  }

  return data as T
}

export function register(username: string, email: string, password: string): Promise<RegisterResponse> {
  return request<RegisterResponse>('/api/auth/register', { method: 'POST', body: { username, email, password } })
}

export function verifyEmail(email: string, code: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/verify-email', { method: 'POST', body: { email, code } })
}

export function resendVerificationCode(email: string): Promise<void> {
  return request<void>('/api/auth/resend-code', { method: 'POST', body: { email } })
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } })
}

export function getMyServers(): Promise<ServerSummary[]> {
  return request<ServerSummary[]>('/api/servers', { method: 'GET' })
}

export function createServer(name: string): Promise<string> {
  return request<string>('/api/servers', { method: 'POST', body: { name } })
}

export function createChannel(
  serverId: string,
  name: string,
  type: 'text' | 'voice',
): Promise<string> {
  return request<string>(`/api/servers/${serverId}/channels`, { method: 'POST', body: { name, type } })
}

export function joinServer(serverId: string): Promise<void> {
  return request<void>(`/api/servers/${serverId}/join`, { method: 'POST' })
}

export function getChannelMessages(channelId: string): Promise<MessageSummary[]> {
  return request<MessageSummary[]>(`/api/channels/${channelId}/messages`, { method: 'GET' })
}
