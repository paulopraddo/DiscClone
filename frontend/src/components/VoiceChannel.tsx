import { useEffect, useRef, useState } from 'react'
import type { MediaConnection } from 'peerjs'
import { ensureConnected, joinVoiceChannel, leaveVoiceChannel } from '../services/chatHub'
import { callPeer, onIncomingCall } from '../services/peer'

interface VoiceChannelProps {
  channelId: string
  channelName: string
  peerId: string | null
}

interface VoiceParticipantPayload {
  peerId: string
}

function VoiceChannel({ channelId, channelName, peerId }: VoiceChannelProps) {
  const [isJoined, setIsJoined] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const callsRef = useRef<Map<string, MediaConnection>>(new Map())
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  function attachRemoteStream(remotePeerId: string, stream: MediaStream) {
    let audio = audioElementsRef.current.get(remotePeerId)

    if (!audio) {
      audio = new Audio()
      audio.autoplay = true
      audioElementsRef.current.set(remotePeerId, audio)
    }

    audio.srcObject = stream
    setParticipants((current) => (current.includes(remotePeerId) ? current : [...current, remotePeerId]))
  }

  function removeParticipant(remotePeerId: string) {
    callsRef.current.get(remotePeerId)?.close()
    callsRef.current.delete(remotePeerId)
    audioElementsRef.current.get(remotePeerId)?.pause()
    audioElementsRef.current.delete(remotePeerId)
    setParticipants((current) => current.filter((id) => id !== remotePeerId))
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

    function handleParticipantLeft(payload: VoiceParticipantPayload) {
      removeParticipant(payload.peerId)
    }

    ensureConnected().then((hub) => {
      hub.on('VoiceParticipantLeft', handleParticipantLeft)
    })

    return () => {
      offIncomingCall()
      ensureConnected().then((hub) => {
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

      const existingPeers = await joinVoiceChannel(channelId, peerId)

      for (const remotePeerId of existingPeers) {
        const call = await callPeer(remotePeerId, stream, { type: 'voice' })
        callsRef.current.set(remotePeerId, call)
        call.on('stream', (remoteStream) => attachRemoteStream(remotePeerId, remoteStream))
        call.on('close', () => removeParticipant(remotePeerId))
      }

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

    setParticipants([])
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
        <ul className="voice-participants">
          <li>Você</li>
          {participants.map((participantId) => (
            <li key={participantId}>{participantId}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default VoiceChannel
