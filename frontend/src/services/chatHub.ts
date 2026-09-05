import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import { notifyUnauthorized } from '../lib/authEvents'

export interface VoiceParticipant {
  peerId: string
  username: string
}

export interface VoiceChannelState {
  participants: VoiceParticipant[]
}

let connection: HubConnection | null = null
let connectPromise: Promise<void> | null = null
let authToken: string | null = null

let activeChannelId: string | null = null
let activeVoice: { channelId: string; peerId: string } | null = null
let voiceRejoinHandler: ((state: VoiceChannelState) => void) | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function onVoiceRejoin(handler: ((state: VoiceChannelState) => void) | null): void {
  voiceRejoinHandler = handler
}

function getConnection(): HubConnection {
  if (connection) {
    return connection
  }

  connection = new HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat`, {
      accessTokenFactory: () => authToken ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  // SignalR issues a new ConnectionId on reconnect, which silently drops any
  // group membership (channel/voice groups) the previous connection had.
  // Without rejoining here, broadcasts (messages, screen share, participants)
  // stop reaching this client after any transient disconnect.
  connection.onreconnected(async () => {
    const hub = connection!

    if (activeChannelId) {
      await hub.invoke('JoinChannel', activeChannelId).catch(() => undefined)
    }

    if (activeVoice) {
      const state = await hub
        .invoke<VoiceChannelState>('JoinVoiceChannel', activeVoice.channelId, activeVoice.peerId)
        .catch(() => null)

      if (state) {
        voiceRejoinHandler?.(state)
      }
    }
  })

  return connection
}

export async function ensureConnected(): Promise<HubConnection> {
  const hub = getConnection()

  if (hub.state === HubConnectionState.Connected) {
    return hub
  }

  connectPromise ??= hub.start().catch((err) => {
    connectPromise = null

    // O SignalR não expõe um status code tipado aqui — só a mensagem do erro
    // de negociação. É a mesma sessão morta que a API REST detecta como 401;
    // avisamos o mesmo jeito para a pessoa não ficar presa numa tela vazia.
    if (authToken && err instanceof Error && /401|unauthorized/i.test(err.message)) {
      notifyUnauthorized()
    }

    throw err
  })

  await connectPromise
  return hub
}

export async function joinChannel(channelId: string): Promise<void> {
  const hub = await ensureConnected()
  activeChannelId = channelId
  await hub.invoke('JoinChannel', channelId)
}

export async function leaveChannel(channelId: string): Promise<void> {
  if (activeChannelId === channelId) {
    activeChannelId = null
  }

  if (connection?.state === HubConnectionState.Connected) {
    await connection.invoke('LeaveChannel', channelId)
  }
}

export async function sendMessage(channelId: string, content: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('SendMessage', channelId, content)
}

export async function editMessage(messageId: string, content: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('EditMessage', messageId, content)
}

export async function deleteMessage(messageId: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('DeleteMessage', messageId)
}

export async function joinVoiceChannel(channelId: string, peerId: string): Promise<VoiceChannelState> {
  const hub = await ensureConnected()
  activeVoice = { channelId, peerId }
  return hub.invoke<VoiceChannelState>('JoinVoiceChannel', channelId, peerId)
}

export async function leaveVoiceChannel(channelId: string): Promise<void> {
  if (activeVoice?.channelId === channelId) {
    activeVoice = null
  }

  if (connection?.state === HubConnectionState.Connected) {
    await connection.invoke('LeaveVoiceChannel', channelId)
  }
}

export async function startVoiceScreenShare(channelId: string, peerId: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('StartVoiceScreenShare', channelId, peerId)
}

export async function stopVoiceScreenShare(channelId: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('StopVoiceScreenShare', channelId)
}

/** Observa quem está num canal de voz sem entrar de fato na call. */
export async function watchVoiceChannel(channelId: string): Promise<VoiceChannelState> {
  const hub = await ensureConnected()
  return hub.invoke<VoiceChannelState>('WatchVoiceChannel', channelId)
}

export async function unwatchVoiceChannel(channelId: string): Promise<void> {
  if (connection?.state === HubConnectionState.Connected) {
    await connection.invoke('UnwatchVoiceChannel', channelId)
  }
}
