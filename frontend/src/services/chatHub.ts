import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'

let connection: HubConnection | null = null
let connectPromise: Promise<void> | null = null
let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

function getConnection(): HubConnection {
  connection ??= new HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat`, {
      accessTokenFactory: () => authToken ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  return connection
}

export async function ensureConnected(): Promise<HubConnection> {
  const hub = getConnection()

  if (hub.state === HubConnectionState.Connected) {
    return hub
  }

  connectPromise ??= hub.start().catch((err) => {
    connectPromise = null
    throw err
  })

  await connectPromise
  return hub
}

export async function joinChannel(channelId: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('JoinChannel', channelId)
}

export async function leaveChannel(channelId: string): Promise<void> {
  if (connection?.state === HubConnectionState.Connected) {
    await connection.invoke('LeaveChannel', channelId)
  }
}

export async function sendMessage(channelId: string, content: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('SendMessage', channelId, content)
}

export async function startScreenShare(channelId: string, peerId: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('StartScreenShare', channelId, peerId)
}

export async function stopScreenShare(channelId: string): Promise<void> {
  const hub = await ensureConnected()
  await hub.invoke('StopScreenShare', channelId)
}

export async function joinVoiceChannel(channelId: string, peerId: string): Promise<string[]> {
  const hub = await ensureConnected()
  return hub.invoke<string[]>('JoinVoiceChannel', channelId, peerId)
}

export async function leaveVoiceChannel(channelId: string): Promise<void> {
  if (connection?.state === HubConnectionState.Connected) {
    await connection.invoke('LeaveVoiceChannel', channelId)
  }
}
