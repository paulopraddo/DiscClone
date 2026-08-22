import { useEffect, useRef, useState } from 'react'
import type { MediaConnection } from 'peerjs'
import {
  ensureConnected,
  joinVoiceChannel,
  leaveVoiceChannel,
  type ActiveScreenShare,
  type VoiceParticipant,
} from '../services/chatHub'
import { callPeer, onIncomingCall } from '../services/peer'
import ScreenShare from './ScreenShare'

interface VoiceChannelProps {
  channelId: string
  channelName: string
  localUserId: string
  peerId: string | null
}

function VoiceChannel({ channelId, channelName, localUserId, peerId }: VoiceChannelProps) {
  const [isJoined, setIsJoined] = useState(false)
  const [participants, setParticipants] = useState<VoiceParticipant[]>([])
  const [activeScreenShare, setActiveScreenShare] = useState<ActiveScreenShare | null>(null)
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const callsRef = useRef<Map<string, MediaConnection>>(new Map())
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const usernamesRef = useRef<Map<string, string>>(new Map())

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

  useEffect(() => {
    const offIncomingCall = onIncomingCall((call) => {
      if ((call.metadata as { type?: string } | undefined)?.type !== 'voice') {
        return
      }

      call.answer(localStreamRef.current ?? undefined)
      callsRef.current.set(call.peer, call)
      call.on('stream', (remoteStream) => attachRemoteStream(call.peer, remoteStream))
      call.on('close', () => removeParticipant(call.peer))
    })

    function handleParticipantJoined(payload: VoiceParticipant) {
      usernamesRef.current.set(payload.peerId, payload.username)
    }

    function handleParticipantLeft(payload: { peerId: string }) {
      removeParticipant(payload.peerId)
    }

    ensureConnected().then((hub) => {
      hub.on('VoiceParticipantJoined', handleParticipantJoined)
      hub.on('VoiceParticipantLeft', handleParticipantLeft)
    })

    return () => {
      offIncomingCall()
      ensureConnected().then((hub) => {
        hub.off('VoiceParticipantJoined', handleParticipantJoined)
        hub.off('VoiceParticipantLeft', handleParticipantLeft)
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

      for (const participant of state.participants) {
        usernamesRef.current.set(participant.peerId, participant.username)

        const call = await callPeer(participant.peerId, stream, { type: 'voice' })
        callsRef.current.set(participant.peerId, call)
        call.on('stream', (remoteStream) => attachRemoteStream(participant.peerId, remoteStream))
        call.on('close', () => removeParticipant(participant.peerId))
      }

      setActiveScreenShare(state.screenShare)
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

    setParticipants([])
    setActiveScreenShare(null)
    setIsJoined(false)
    leaveVoiceChannel(channelId).catch(() => undefined)
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

          <ScreenShare
            channelId={channelId}
            localUserId={localUserId}
            peerId={peerId}
            mode="voice"
            initialActiveShare={activeScreenShare}
          />
        </>
      )}
    </div>
  )
}

export default VoiceChannel
