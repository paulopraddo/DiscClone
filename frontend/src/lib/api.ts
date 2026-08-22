export interface AuthResponse {
  userId: string
  username: string
  token: string
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = Array.isArray(data) ? data.join(' ') : 'Falha na requisição.'
    throw new Error(message)
  }

  return data as T
}

export function register(username: string, email: string, password: string): Promise<AuthResponse> {
  return postJson<AuthResponse>('/api/auth/register', { username, email, password })
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return postJson<AuthResponse>('/api/auth/login', { email, password })
}
