import { useEffect, useRef, useState } from 'react'
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

interface VoiceChannelProps {
  channelId: string
  channelName: string
  localUserId: string
}

interface RemoteScreenShare {
  authorId: string
  stream: MediaStream
}

function VoiceChannel({ channelId, channelName, localUserId }: VoiceChannelProps) {
  const { peerId } = usePeerId()
  const [isJoined, setIsJoined] = useState(false)
  const [participants, setParticipants] = useState<VoiceParticipant[]>([])
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const [remoteScreenShare, setRemoteScreenShare] = useState<RemoteScreenShare | null>(null)
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const callsRef = useRef<Map<string, MediaConnection>>(new Map())
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const usernamesRef = useRef<Map<string, string>>(new Map())

  const screenStreamRef = useRef<MediaStream | null>(null)
  const screenCallsRef = useRef<Map<string, MediaConnection>>(new Map())
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  function attachRemoteStream(remotePeerId: string, stream: MediaStream) {
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
  }

  function removeParticipant(remotePeerId: string) {
    callsRef.current.get(remotePeerId)?.close()
    callsRef.current.delete(remotePeerId)
    audioElementsRef.current.get(remotePeerId)?.pause()
    audioElementsRef.current.delete(remotePeerId)
    usernamesRef.current.delete(remotePeerId)
    setParticipants((current) => current.filter((p) => p.peerId !== remotePeerId))
  }

  async function connectToParticipants(stream: MediaStream, newParticipants: VoiceParticipant[]) {
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
  }

  // Quem compartilha a tela liga diretamente para cada participante com o
  // stream real (em vez de esperar que o participante ligue com um stream
  // vazio) — WebRTC não permite adicionar uma faixa de video numa resposta
  // que nao existia na oferta original, entao a direcao da chamada importa.
  function callParticipantWithScreen(remotePeerId: string, stream: MediaStream) {
    callPeer(remotePeerId, stream, { type: 'screen', authorId: localUserId })
      .then((call) => screenCallsRef.current.set(remotePeerId, call))
      .catch(() => undefined)
  }

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
        call.answer()
        call.on('stream', (remoteStream) => {
          setRemoteScreenShare({ authorId: metadata.authorId ?? call.peer, stream: remoteStream })
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
          }
        })
        call.on('close', () => setRemoteScreenShare(null))
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
    }

    ensureConnected().then((hub) => {
      hub.on('VoiceParticipantJoined', handleParticipantJoined)
      hub.on('VoiceParticipantLeft', handleParticipantLeft)
      hub.on('ScreenShareStopped', handleScreenShareStopped)
    })

    // Se a conexao SignalR cair e reconectar, o servidor perde o registro de
    // que estavamos na sala de voz. Ao reconectar, reentramos e reconectamos
    // (via PeerJS) a qualquer participante novo que tenha entrado nesse meio tempo.
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
  }, [channelId])

  async function handleJoin() {
    if (!peerId) {
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream

      const state = await joinVoiceChannel(channelId, peerId)
      await connectToParticipants(stream, state.participants)

      setIsJoined(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar no canal de voz.')
    }
  }

  function handleLeave() {
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null

    callsRef.current.forEach((call) => call.close())
    callsRef.current.clear()
    audioElementsRef.current.clear()
    usernamesRef.current.clear()

    stopSharingScreen()

    setParticipants([])
    setIsJoined(false)
    leaveVoiceChannel(channelId).catch(() => undefined)
  }

  async function handleStartSharingScreen() {
    if (!peerId) {
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      screenStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      stream.getVideoTracks()[0].addEventListener('ended', stopSharingScreen)

      for (const participant of participants) {
        callParticipantWithScreen(participant.peerId, stream)
      }

      setIsSharingScreen(true)
      setError(null)
      await startVoiceScreenShare(channelId, peerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar o compartilhamento de tela.')
    }
  }

  function stopSharingScreen() {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    screenStreamRef.current = null

    screenCallsRef.current.forEach((call) => call.close())
    screenCallsRef.current.clear()

    setIsSharingScreen(false)
    stopVoiceScreenShare(channelId).catch(() => undefined)
  }

  return (
    <div className="voice-channel">
      <h2 className="voice-channel-title">🔊 {channelName}</h2>

      <button type="button" onClick={isJoined ? handleLeave : handleJoin} disabled={!peerId}>
        {isJoined ? 'Sair do canal de voz' : 'Entrar no canal de voz'}
      </button>

      {error && <div className="chat-error">{error}</div>}

      {isJoined && (
        <>
          <ul className="voice-participants">
            <li>Você</li>
            {participants.map((participant) => (
              <li key={participant.peerId}>{participant.username}</li>
            ))}
          </ul>

          <div className="screen-share">
            <div className="screen-share-controls">
              <button type="button" onClick={isSharingScreen ? stopSharingScreen : handleStartSharingScreen}>
                {isSharingScreen ? 'Parar compartilhamento' : 'Compartilhar tela'}
              </button>
            </div>

            <div className="screen-share-videos">
              <video
                ref={localVideoRef}
                className="screen-share-video"
                autoPlay
                playsInline
                muted
                hidden={!isSharingScreen}
              />
              <video
                ref={remoteVideoRef}
                className="screen-share-video"
                autoPlay
                playsInline
                hidden={!remoteScreenShare}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default VoiceChannel
