import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import * as api from '../lib/api'
import { setAuthToken } from '../services/chatHub'

interface AuthUser {
  userId: string
  username: string
  token: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'discclone:auth'

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as AuthUser) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = readStoredUser()
    if (stored) {
      setAuthToken(stored.token)
    }
    return stored
  })

  const applyAuth = useCallback((auth: api.AuthResponse) => {
    const authUser: AuthUser = { userId: auth.userId, username: auth.username, token: auth.token }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    setAuthToken(auth.token)
    setUser(authUser)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      applyAuth(await api.login(email, password))
    },
    [applyAuth],
  )

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      applyAuth(await api.register(username, email, password))
    },
    [applyAuth],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.')
  }

  return context
}
