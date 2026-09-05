import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as api from '../lib/api'
import { setUnauthorizedHandler } from '../lib/authEvents'
import { setAuthToken } from '../services/chatHub'

interface AuthUser {
  userId: string
  username: string
  token: string
}

interface AuthContextValue {
  user: AuthUser | null
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<string>
  verifyEmail: (email: string, code: string) => Promise<void>
  resendVerificationCode: (email: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>
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
      api.setApiAuthToken(stored.token)
    }
    return stored
  })

  const [sessionExpired, setSessionExpired] = useState(false)

  const applyAuth = useCallback((auth: api.AuthResponse) => {
    const authUser: AuthUser = { userId: auth.userId, username: auth.username, token: auth.token }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    setAuthToken(auth.token)
    api.setApiAuthToken(auth.token)
    setSessionExpired(false)
    setUser(authUser)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      applyAuth(await api.login(email, password))
    },
    [applyAuth],
  )

  const register = useCallback(async (username: string, email: string, password: string) => {
    const result = await api.register(username, email, password)
    return result.email
  }, [])

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      applyAuth(await api.verifyEmail(email, code))
    },
    [applyAuth],
  )

  const resendVerificationCode = useCallback(async (email: string) => {
    await api.resendVerificationCode(email)
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    await api.forgotPassword(email)
  }, [])

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    await api.resetPassword(email, code, newPassword)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
    api.setApiAuthToken(null)
    setUser(null)
  }, [])

  // Uma requisição autenticada (REST ou SignalR) que volta com 401 significa
  // que o token guardado morreu (expirou, foi revogado etc.). Sem isso, a
  // pessoa ficava presa numa tela autenticada vazia — nada carregava e nada
  // avisava por quê — até deslogar e logar de novo manualmente.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSessionExpired(true)
      logout()
    })

    return () => setUnauthorizedHandler(null)
  }, [logout])

  const value = useMemo(
    () => ({
      user,
      sessionExpired,
      login,
      register,
      verifyEmail,
      resendVerificationCode,
      forgotPassword,
      resetPassword,
      logout,
    }),
    [user, sessionExpired, login, register, verifyEmail, resendVerificationCode, forgotPassword, resetPassword, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.')
  }

  return context
}
