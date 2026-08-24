import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import type { MediaConnection } from 'peerjs'
import {
  ensureConnected,
  joinVoiceChannel,
  leaveVoiceChannel,
  onVoiceRejoin,
  startVoiceScreenShare,
  stopVoiceScreenShare,
  type VoiceParticipant,
} from '../services/chatHub'
import { callPeer, onIncomingCall } from '../services/peer'
import { usePeerId } from '../hooks/usePeerId'
import { useAuth } from './AuthContext'

interface RemoteScreenShare {
  authorId: string
  stream: MediaStream
}

interface RemoteScreenSharer {
  authorId: string
  username: string
}

interface ActiveVoiceChannel {
  serverId: string
  channelId: string
  channelName: string
}

interface VoiceCallContextValue {
  active: ActiveVoiceChannel | null
  isJoined: boolean
  isConnecting: boolean
  isMuted: boolean
  isSharingScreen: boolean
  participants: VoiceParticipant[]
  remoteScreenSharer: RemoteScreenSharer | null
  remoteScreenShare: RemoteScreenShare | null
  isViewingRemoteScreen: boolean
  localScreenStream: MediaStream | null
  error: string | null
  localVideoRef: RefObject<HTMLVideoElement | null>
  remoteVideoRef: RefObject<HTMLVideoElement | null>
  joinChannel: (serverId: string, channelId: string, channelName: string) => void
  leaveCall: () => void
  toggleMute: () => void
  startScreenShare: () => Promise<void>
  stopScreenShare: () => void
  viewRemoteScreen: () => void
  hideRemoteScreen: () => void
}

const VoiceCallContext = createContext<VoiceCallContextValue | undefined>(undefined)

export function VoiceCallProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { peerId } = usePeerId()

  const [active, setActive] = useState<ActiveVoiceChannel | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [participants, setParticipants] = useState<VoiceParticipant[]>([])
  const [remoteScreenSharer, setRemoteScreenSharer] = useState<RemoteScreenSharer | null>(null)
  const [remoteScreenShare, setRemoteScreenShare] = useState<RemoteScreenShare | null>(null)
  const [isViewingRemoteScreen, setIsViewingRemoteScreen] = useState(false)
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const callsRef = useRef<Map<string, MediaConnection>>(new Map())
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const usernamesRef = useRef<Map<string, string>>(new Map())
  const screenStreamRef = useRef<MediaStream | null>(null)
  const screenCallsRef = useRef<Map<string, MediaConnection>>(new Map())
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pendingScreenCallRef = useRef<MediaConnection | null>(null)
  const connectedChannelIdRef = useRef<string | null>(null)
  const localUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    localUserIdRef.current = user?.userId ?? null
  }, [user])

  const attachRemoteStream = useCallback((remotePeerId: string, stream: MediaStream) => {
    let audio = audioElementsRef.current.get(remotePeerId)

    if (!audio) {
      audio = new Audio()
      audio.autoplay = true
      audioElementsRef.current.set(remotePeerId, audio)
    }

    audio.srcObject = stream

    const username = usernamesRef.current.get(remotePeerId) ?? remotePeerId
    setParticipants((current) =>
      current.some((p) => p.peerId === remotePeerId) ? current : [...current, { peerId: remotePeerId, username }],
    )
  }, [])

  const removeParticipant = useCallback((remotePeerId: string) => {
    callsRef.current.get(remotePeerId)?.close()
    callsRef.current.delete(remotePeerId)
    audioElementsRef.current.get(remotePeerId)?.pause()
    audioElementsRef.current.delete(remotePeerId)
    usernamesRef.current.delete(remotePeerId)
    setParticipants((current) => current.filter((p) => p.peerId !== remotePeerId))
  }, [])

  const connectToParticipants = useCallback(
    async (stream: MediaStream, newParticipants: VoiceParticipant[]) => {
      for (const participant of newParticipants) {
        usernamesRef.current.set(participant.peerId, participant.username)

        if (callsRef.current.has(participant.peerId)) {
          continue
        }

        try {
          const call = await callPeer(participant.peerId, stream, { type: 'voice' })
          callsRef.current.set(participant.peerId, call)
          call.on('stream', (remoteStream) => attachRemoteStream(participant.peerId, remoteStream))
          call.on('close', () => removeParticipant(participant.peerId))
        } catch {
          // ignora falha ao conectar a um participante especifico
        }
      }
    },
    [attachRemoteStream, removeParticipant],
  )

  const callParticipantWithScreen = useCallback((remotePeerId: string, stream: MediaStream) => {
    callPeer(remotePeerId, stream, { type: 'screen', authorId: localUserIdRef.current })
      .then((call) => screenCallsRef.current.set(remotePeerId, call))
      .catch(() => undefined)
  }, [])

  const stopScreenShareInternal = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    screenStreamRef.current = null
    screenCallsRef.current.forEach((call) => call.close())
    screenCallsRef.current.clear()
    setIsSharingScreen(false)
    setLocalScreenStream(null)
  }, [])

  const teardownCallState = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    callsRef.current.forEach((call) => call.close())
    callsRef.current.clear()
    audioElementsRef.current.forEach((audio) => audio.pause())
    audioElementsRef.current.clear()
    usernamesRef.current.clear()
    stopScreenShareInternal()
    pendingScreenCallRef.current?.close()
    pendingScreenCallRef.current = null
    setRemoteScreenSharer(null)
    setIsViewingRemoteScreen(false)
    setParticipants([])
    setIsJoined(false)
    setIsMuted(false)
  }, [stopScreenShareInternal])

  // Escuta os eventos de voz do hub durante toda a sessao — nao depende da
  // pagina/rota atual, entao trocar de canal de texto nao derruba a call.
  useEffect(() => {
    const offIncomingCall = onIncomingCall((call) => {
      const metadata = call.metadata as { type?: string; authorId?: string } | undefined

      if (metadata?.type === 'voice') {
        call.answer(localStreamRef.current ?? undefined)
        callsRef.current.set(call.peer, call)
        call.on('stream', (remoteStream) => attachRemoteStream(call.peer, remoteStream))
        call.on('close', () => removeParticipant(call.peer))
        return
      }

      if (metadata?.type === 'screen') {
        // Nao responde automaticamente: quem esta na call escolhe se quer
        // assistir ou nao antes da gente estabelecer a conexao de video.
        const authorId = metadata.authorId ?? call.peer
        const username = usernamesRef.current.get(call.peer) ?? authorId
        pendingScreenCallRef.current = call
        setRemoteScreenSharer({ authorId, username })

        call.on('stream', (remoteStream) => {
          setRemoteScreenShare({ authorId, stream: remoteStream })
          setIsViewingRemoteScreen(true)
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
          }
        })
        call.on('close', () => {
          pendingScreenCallRef.current = null
          setRemoteScreenSharer(null)
          setRemoteScreenShare(null)
          setIsViewingRemoteScreen(false)
        })
      }
    })

    function handleParticipantJoined(payload: VoiceParticipant) {
      usernamesRef.current.set(payload.peerId, payload.username)

      if (screenStreamRef.current) {
        callParticipantWithScreen(payload.peerId, screenStreamRef.current)
      }
    }

    function handleParticipantLeft(payload: { peerId: string }) {
      removeParticipant(payload.peerId)
      screenCallsRef.current.get(payload.peerId)?.close()
      screenCallsRef.current.delete(payload.peerId)
    }

    function handleScreenShareStopped(payload: { authorId: string }) {
      setRemoteScreenShare((current) => (current?.authorId === payload.authorId ? null : current))
      setRemoteScreenSharer((current) => (current?.authorId === payload.authorId ? null : current))
      setIsViewingRemoteScreen(false)
      pendingScreenCallRef.current = null
    }

    ensureConnected().then((hub) => {
      hub.on('VoiceParticipantJoined', handleParticipantJoined)
      hub.on('VoiceParticipantLeft', handleParticipantLeft)
      hub.on('ScreenShareStopped', handleScreenShareStopped)
    })

    onVoiceRejoin((state) => {
      if (localStreamRef.current) {
        connectToParticipants(localStreamRef.current, state.participants)
      }

      if (screenStreamRef.current) {
        for (const participant of state.participants) {
          if (!screenCallsRef.current.has(participant.peerId)) {
            callParticipantWithScreen(participant.peerId, screenStreamRef.current)
          }
        }
      }
    })

    return () => {
      offIncomingCall()
      onVoiceRejoin(null)
      ensureConnected().then((hub) => {
        hub.off('VoiceParticipantJoined', handleParticipantJoined)
        hub.off('VoiceParticipantLeft', handleParticipantLeft)
        hub.off('ScreenShareStopped', handleScreenShareStopped)
      })
    }
  }, [attachRemoteStream, removeParticipant, connectToParticipants, callParticipantWithScreen])

  // Conecta (ou troca) ao canal de voz desejado. So roda de novo quando o
  // canal desejado ou o peerId mudam — navegar para um canal de texto nao
  // altera `active`, entao a chamada continua ativa em segundo plano.
  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!active || !peerId || connectedChannelIdRef.current === active.channelId) {
        return
      }

      if (connectedChannelIdRef.current) {
        const previousChannelId = connectedChannelIdRef.current
        teardownCallState()
        connectedChannelIdRef.current = null
        leaveVoiceChannel(previousChannelId).catch(() => undefined)
      }

      setIsConnecting(true)
      setError(null)

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        localStreamRef.current = stream
        const state = await joinVoiceChannel(active.channelId, peerId)

        if (cancelled) {
          return
        }

        await connectToParticipants(stream, state.participants)
        connectedChannelIdRef.current = active.channelId
        setIsJoined(true)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao entrar no canal de voz.')
        }
      } finally {
        if (!cancelled) {
          setIsConnecting(false)
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [active, peerId, connectToParticipants, teardownCallState])

  const joinChannel = useCallback((serverId: string, channelId: string, channelName: string) => {
    setActive((current) => (current?.channelId === channelId ? current : { serverId, channelId, channelName }))
  }, [])

  const leaveCall = useCallback(() => {
    const channelId = connectedChannelIdRef.current ?? active?.channelId ?? null
    teardownCallState()
    connectedChannelIdRef.current = null
    setActive(null)
    setError(null)

    if (channelId) {
      leaveVoiceChannel(channelId).catch(() => undefined)
    }
  }, [active, teardownCallState])

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0]

    if (track) {
      track.enabled = isMuted
    }

    setIsMuted((current) => !current)
  }, [isMuted])

  const startScreenShare = useCallback(async () => {
    if (!peerId || !active) {
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      screenStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      stream.getVideoTracks()[0].addEventListener('ended', stopScreenShareInternal)

      for (const participant of participants) {
        callParticipantWithScreen(participant.peerId, stream)
      }

      setIsSharingScreen(true)
      setLocalScreenStream(stream)
      setError(null)
      await startVoiceScreenShare(active.channelId, peerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar o compartilhamento de tela.')
    }
  }, [peerId, active, participants, callParticipantWithScreen, stopScreenShareInternal])

  const stopScreenShare = useCallback(() => {
    stopScreenShareInternal()

    if (active) {
      stopVoiceScreenShare(active.channelId).catch(() => undefined)
    }
  }, [active, stopScreenShareInternal])

  const viewRemoteScreen = useCallback(() => {
    if (remoteScreenShare) {
      // ja respondemos a chamada antes (o usuario so tinha ocultado o video)
      setIsViewingRemoteScreen(true)
      return
    }

    pendingScreenCallRef.current?.answer()
  }, [remoteScreenShare])

  const hideRemoteScreen = useCallback(() => {
    setIsViewingRemoteScreen(false)
  }, [])

  const value: VoiceCallContextValue = {
    active,
    isJoined,
    isConnecting,
    isMuted,
    isSharingScreen,
    participants,
    remoteScreenSharer,
    remoteScreenShare,
    isViewingRemoteScreen,
    localScreenStream,
    error,
    localVideoRef,
    remoteVideoRef,
    joinChannel,
    leaveCall,
    toggleMute,
    startScreenShare,
    stopScreenShare,
    viewRemoteScreen,
    hideRemoteScreen,
  }

  return <VoiceCallContext.Provider value={value}>{children}</VoiceCallContext.Provider>
}

export function useVoiceCall(): VoiceCallContextValue {
  const context = useContext(VoiceCallContext)

  if (!context) {
    throw new Error('useVoiceCall deve ser usado dentro de um VoiceCallProvider.')
  }

  return context
}
