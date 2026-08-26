import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useServers } from '../contexts/ServersContext'
import { useVoiceCall } from '../contexts/VoiceCallContext'
import { getAvatarColor, getInitials } from '../lib/avatar'
import { ensureConnected, unwatchVoiceChannel, watchVoiceChannel, type VoiceParticipant } from '../services/chatHub'

interface ChannelListProps {
  serverId: string
}

function ChannelList({ serverId }: ChannelListProps) {
  const { servers, createChannel, deleteChannel, renameServer } = useServers()
  const server = servers.find((s) => s.id === serverId)
  const { user } = useAuth()
  const isOwner = server?.ownerId === user?.userId
  const { active: activeVoiceCall, isJoined: isInVoiceCall, isLocalSpeaking, speakingPeerIds } = useVoiceCall()

  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'voice'>('text')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [voiceParticipants, setVoiceParticipants] = useState<Record<string, VoiceParticipant[]>>({})
  const [isRenaming, setIsRenaming] = useState(false)
  const [serverNameDraft, setServerNameDraft] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const voiceChannelIdsKey = (server?.channels ?? [])
    .filter((channel) => channel.type === 'voice')
    .map((channel) => channel.id)
    .join(',')

  // Observa (sem entrar) todos os canais de voz do servidor para mostrar quem
  // está em cada um antes do usuário decidir se quer entrar na call.
  useEffect(() => {
    const ids = voiceChannelIdsKey ? voiceChannelIdsKey.split(',') : []

    if (ids.length === 0) {
      setVoiceParticipants({})
      return
    }

    let isActive = true

    function handleJoined(payload: VoiceParticipant & { channelId: string }) {
      if (!ids.includes(payload.channelId)) {
        return
      }

      setVoiceParticipants((current) => {
        const list = current[payload.channelId] ?? []

        if (list.some((p) => p.peerId === payload.peerId)) {
          return current
        }

        return { ...current, [payload.channelId]: [...list, { peerId: payload.peerId, username: payload.username }] }
      })
    }

    function handleLeft(payload: { channelId: string; peerId: string }) {
      setVoiceParticipants((current) => {
        const list = current[payload.channelId]

        if (!list) {
          return current
        }

        return { ...current, [payload.channelId]: list.filter((p) => p.peerId !== payload.peerId) }
      })
    }

    ensureConnected().then(async (hub) => {
      hub.on('VoiceParticipantJoined', handleJoined)
      hub.on('VoiceParticipantLeft', handleLeft)

      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const state = await watchVoiceChannel(id)
            return [id, state.participants] as const
          } catch {
            return [id, []] as const
          }
        }),
      )

      if (isActive) {
        setVoiceParticipants(Object.fromEntries(entries))
      }
    })

    return () => {
      isActive = false
      ids.forEach((id) => unwatchVoiceChannel(id).catch(() => undefined))
      ensureConnected().then((hub) => {
        hub.off('VoiceParticipantJoined', handleJoined)
        hub.off('VoiceParticipantLeft', handleLeft)
      })
    }
  }, [voiceChannelIdsKey])

  // O servidor so avisa "alguem entrou" para quem ja estava na sala — quem
  // esta entrando nunca recebe o proprio evento. Sem isso, seu nome nunca
  // aparece aqui se essa lista ja estava aberta antes de voce entrar na call.
  function getDisplayedParticipants(channelId: string): Array<VoiceParticipant & { isSpeaking: boolean }> {
    const isThisChannelActive = isInVoiceCall && activeVoiceCall?.channelId === channelId
    const remote = (voiceParticipants[channelId] ?? []).map((participant) => ({
      ...participant,
      // So sabemos quem esta falando no canal em que voce realmente esta
      // conectado — nos outros nao temos o audio de ninguem para analisar.
      isSpeaking: isThisChannelActive && speakingPeerIds.has(participant.peerId),
    }))

    if (!isThisChannelActive || !user) {
      return remote
    }

    if (remote.some((p) => p.username === user.username)) {
      return remote
    }

    return [{ peerId: `self-${user.userId}`, username: user.username, isSpeaking: isLocalSpeaking }, ...remote]
  }

  function cancelCreate() {
    setIsCreating(false)
    setName('')
    setError(null)
  }

  useEffect(() => {
    if (!isCreating) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        cancelCreate()
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        cancelCreate()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCreating])

  async function handleCopyInvite() {
    try {
      await navigator.clipboard.writeText(serverId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Não foi possível copiar automaticamente. Copie o ID do servidor:', serverId)
    }
  }

  function startRenaming() {
    setServerNameDraft(server?.name ?? '')
    setRenameError(null)
    setIsRenaming(true)
  }

  function cancelRenaming() {
    setIsRenaming(false)
    setRenameError(null)
  }

  async function handleRenameServer(event: React.FormEvent) {
    event.preventDefault()

    if (!serverNameDraft.trim()) {
      return
    }

    try {
      await renameServer(serverId, serverNameDraft.trim())
      setIsRenaming(false)
      setRenameError(null)
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Falha ao renomear servidor.')
    }
  }

  async function handleDeleteChannel(event: React.MouseEvent, channelId: string, channelName: string) {
    event.preventDefault()
    event.stopPropagation()

    if (!window.confirm(`Apagar o canal #${channelName}? Essa ação não pode ser desfeita.`)) {
      return
    }

    try {
      await deleteChannel(serverId, channelId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao apagar canal.')
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
      {isRenaming ? (
        <form className="channel-list-title-form" onSubmit={handleRenameServer}>
          <input
            type="text"
            value={serverNameDraft}
            onChange={(event) => setServerNameDraft(event.target.value)}
            autoFocus
            onBlur={cancelRenaming}
          />
          {renameError && <span className="chat-error">{renameError}</span>}
        </form>
      ) : (
        <h2
          className={`channel-list-title${isOwner ? ' channel-list-title-editable' : ''}`}
          title={isOwner ? 'Clique para renomear o servidor' : undefined}
          onClick={isOwner ? startRenaming : undefined}
        >
          {server?.name ?? 'Servidor'}
        </h2>
      )}
      <button type="button" className="invite-button" onClick={handleCopyInvite}>
        {copied ? 'ID copiado!' : 'Convidar (copiar ID)'}
      </button>
      <ul>
        {server?.channels.map((channel) => {
          const displayedParticipants = channel.type === 'voice' ? getDisplayedParticipants(channel.id) : []

          return (
            <li key={channel.id}>
              <div className="channel-link-row">
                <NavLink
                  to={`/servers/${serverId}/channels/${channel.id}`}
                  className={({ isActive }) => `channel-link${isActive ? ' active' : ''}`}
                >
                  {channel.type === 'text' ? '#' : '🔊'} {channel.name}
                </NavLink>
                {isOwner && (
                  <button
                    type="button"
                    className="channel-delete-button"
                    title="Apagar canal"
                    onClick={(event) => handleDeleteChannel(event, channel.id, channel.name)}
                  >
                    ✕
                  </button>
                )}
              </div>

              {displayedParticipants.length > 0 && (
                <ul className="voice-channel-members">
                  {displayedParticipants.map((participant) => (
                    <li key={participant.peerId} className="voice-channel-member">
                      <span
                        className={`voice-avatar-xs${participant.isSpeaking ? ' speaking' : ''}`}
                        style={{ background: getAvatarColor(participant.peerId) }}
                      >
                        {getInitials(participant.username)}
                      </span>
                      <span className="voice-channel-member-name">{participant.username}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      {isCreating ? (
        <form className="create-channel-form" onSubmit={handleCreateChannel} ref={formRef}>
          <div className="panel-form-header">
            <span>Criar canal</span>
            <button type="button" className="panel-close-button" onClick={cancelCreate} aria-label="Fechar">
              ✕
            </button>
          </div>
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
