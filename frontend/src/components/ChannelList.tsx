import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useServers } from '../contexts/ServersContext'

interface ChannelListProps {
  serverId: string
}

function ChannelList({ serverId }: ChannelListProps) {
  const { servers, createChannel } = useServers()
  const server = servers.find((s) => s.id === serverId)

  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'voice'>('text')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopyInvite() {
    try {
      await navigator.clipboard.writeText(serverId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Não foi possível copiar automaticamente. Copie o ID do servidor:', serverId)
    }
  }

  async function handleCreateChannel(event: React.FormEvent) {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    try {
      await createChannel(serverId, name.trim(), type)
      setName('')
      setIsCreating(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar canal.')
    }
  }

  return (
    <nav className="channel-list">
      <h2 className="channel-list-title">{server?.name ?? 'Servidor'}</h2>
      <button type="button" className="invite-button" onClick={handleCopyInvite}>
        {copied ? 'ID copiado!' : 'Convidar (copiar ID)'}
      </button>
      <ul>
        {server?.channels.map((channel) => (
          <li key={channel.id}>
            <NavLink
              to={`/servers/${serverId}/channels/${channel.id}`}
              className={({ isActive }) => `channel-link${isActive ? ' active' : ''}`}
            >
              {channel.type === 'text' ? '#' : '🔊'} {channel.name}
            </NavLink>
          </li>
        ))}
      </ul>

      {isCreating ? (
        <form className="create-channel-form" onSubmit={handleCreateChannel}>
          <input
            type="text"
            placeholder="Nome do canal"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          <select value={type} onChange={(event) => setType(event.target.value as 'text' | 'voice')}>
            <option value="text">Texto</option>
            <option value="voice">Voz</option>
          </select>
          {error && <span className="chat-error">{error}</span>}
          <button type="submit">Criar canal</button>
        </form>
      ) : (
        <button type="button" className="create-channel-button" onClick={() => setIsCreating(true)}>
          + Criar canal
        </button>
      )}
    </nav>
  )
}

export default ChannelList
