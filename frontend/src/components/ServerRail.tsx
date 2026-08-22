import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useServers } from '../contexts/ServersContext'

type PanelMode = 'closed' | 'create' | 'join'

function ServerRail() {
  const { user, logout } = useAuth()
  const { servers, createServer, joinServer } = useServers()
  const [mode, setMode] = useState<PanelMode>('closed')
  const [name, setName] = useState('')
  const [serverId, setServerId] = useState('')
  const [error, setError] = useState<string | null>(null)

  function togglePanel(nextMode: PanelMode) {
    setMode((current) => (current === nextMode ? 'closed' : nextMode))
    setError(null)
  }

  async function handleCreateServer(event: React.FormEvent) {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    try {
      await createServer(name.trim())
      setName('')
      setMode('closed')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar servidor.')
    }
  }

  async function handleJoinServer(event: React.FormEvent) {
    event.preventDefault()

    if (!serverId.trim()) {
      return
    }

    try {
      await joinServer(serverId.trim())
      setServerId('')
      setMode('closed')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar no servidor.')
    }
  }

  return (
    <nav className="server-rail">
      <NavLink to="/" end className="server-icon home-icon">
        DC
      </NavLink>
      <div className="server-rail-divider" />
      {servers.map((server) => (
        <NavLink
          key={server.id}
          to={`/servers/${server.id}`}
          className={({ isActive }) => `server-icon${isActive ? ' active' : ''}`}
          title={server.name}
        >
          {server.name.slice(0, 2).toUpperCase()}
        </NavLink>
      ))}

      <button
        type="button"
        className="server-icon create-server-icon"
        title="Criar servidor"
        onClick={() => togglePanel('create')}
      >
        +
      </button>

      <button
        type="button"
        className="server-icon join-server-icon"
        title="Entrar em servidor"
        onClick={() => togglePanel('join')}
      >
        🔗
      </button>

      {mode === 'create' && (
        <form className="create-server-form" onSubmit={handleCreateServer}>
          <input
            type="text"
            placeholder="Nome do servidor"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          {error && <span className="chat-error">{error}</span>}
          <button type="submit">Criar</button>
        </form>
      )}

      {mode === 'join' && (
        <form className="create-server-form" onSubmit={handleJoinServer}>
          <input
            type="text"
            placeholder="ID do servidor (convite)"
            value={serverId}
            onChange={(event) => setServerId(event.target.value)}
            autoFocus
          />
          {error && <span className="chat-error">{error}</span>}
          <button type="submit">Entrar</button>
        </form>
      )}

      <div className="server-rail-spacer" />

      <button
        type="button"
        className="server-icon logout-icon"
        title={`Sair (${user?.username})`}
        onClick={logout}
      >
        ⏻
      </button>
    </nav>
  )
}

export default ServerRail
