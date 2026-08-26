import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as api from '../lib/api'

interface ServersContextValue {
  servers: api.ServerSummary[]
  isLoading: boolean
  error: string | null
  createServer: (name: string) => Promise<void>
  createChannel: (serverId: string, name: string, type: 'text' | 'voice') => Promise<void>
  joinServer: (serverId: string) => Promise<void>
  renameServer: (serverId: string, name: string) => Promise<void>
  leaveServer: (serverId: string) => Promise<void>
  deleteServer: (serverId: string) => Promise<void>
  renameChannel: (serverId: string, channelId: string, name: string) => Promise<void>
  deleteChannel: (serverId: string, channelId: string) => Promise<void>
  refresh: () => Promise<void>
}

const ServersContext = createContext<ServersContextValue | null>(null)

export function ServersProvider({ children }: { children: ReactNode }) {
  const [servers, setServers] = useState<api.ServerSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)

    try {
      setServers(await api.getMyServers())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar servidores.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createServer = useCallback(
    async (name: string) => {
      await api.createServer(name)
      await refresh()
    },
    [refresh],
  )

  const createChannel = useCallback(
    async (serverId: string, name: string, type: 'text' | 'voice') => {
      await api.createChannel(serverId, name, type)
      await refresh()
    },
    [refresh],
  )

  const joinServer = useCallback(
    async (serverId: string) => {
      await api.joinServer(serverId)
      await refresh()
    },
    [refresh],
  )

  const renameServer = useCallback(
    async (serverId: string, name: string) => {
      await api.renameServer(serverId, name)
      await refresh()
    },
    [refresh],
  )

  const leaveServer = useCallback(
    async (serverId: string) => {
      await api.leaveServer(serverId)
      await refresh()
    },
    [refresh],
  )

  const deleteServer = useCallback(
    async (serverId: string) => {
      await api.deleteServer(serverId)
      await refresh()
    },
    [refresh],
  )

  const renameChannel = useCallback(
    async (serverId: string, channelId: string, name: string) => {
      await api.renameChannel(serverId, channelId, name)
      await refresh()
    },
    [refresh],
  )

  const deleteChannel = useCallback(
    async (serverId: string, channelId: string) => {
      await api.deleteChannel(serverId, channelId)
      await refresh()
    },
    [refresh],
  )

  const value = useMemo(
    () => ({
      servers,
      isLoading,
      error,
      createServer,
      createChannel,
      joinServer,
      renameServer,
      leaveServer,
      deleteServer,
      renameChannel,
      deleteChannel,
      refresh,
    }),
    [
      servers,
      isLoading,
      error,
      createServer,
      createChannel,
      joinServer,
      renameServer,
      leaveServer,
      deleteServer,
      renameChannel,
      deleteChannel,
      refresh,
    ],
  )

  return <ServersContext.Provider value={value}>{children}</ServersContext.Provider>
}

export function useServers(): ServersContextValue {
  const context = useContext(ServersContext)

  if (!context) {
    throw new Error('useServers deve ser usado dentro de um ServersProvider.')
  }

  return context
}
