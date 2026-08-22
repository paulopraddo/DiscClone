import { useEffect, useRef, useState } from 'react'
import type { MediaConnection } from 'peerjs'
import { ensureConnected, startScreenShare, stopScreenShare } from '../services/chatHub'
import { callPeer, onIncomingCall } from '../services/peer'

interface ScreenShareProps {
  channelId: string
  localUserId: string
  peerId: string | null
}

interface ScreenShareStartedPayload {
  authorId: string
  peerId: string
}

interface ScreenShareStoppedPayload {
  authorId: string
}

function ScreenShare({ channelId, localUserId, peerId }: ScreenShareProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [remoteAuthorId, setRemoteAuthorId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const activeCallRef = useRef<MediaConnection | null>(null)

  useEffect(() => {
    const offIncomingCall = onIncomingCall((call) => {
      if ((call.metadata as { type?: string } | undefined)?.type !== 'screen') {
        return
      }

      call.answer(localStreamRef.current ?? undefined)
    })

    function handleStarted(payload: ScreenShareStartedPayload) {
      if (payload.authorId === localUserId) {
        return
      }

      callPeer(payload.peerId, new MediaStream(), { type: 'screen' })
        .then((call) => {
          activeCallRef.current = call
          call.on('stream', (remoteStream) => {
            setRemoteAuthorId(payload.authorId)
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream
            }
          })
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Falha ao conectar ao compartilhamento.')
        })
    }

    function handleStopped(payload: ScreenShareStoppedPayload) {
      if (payload.authorId === remoteAuthorId) {
        activeCallRef.current?.close()
        activeCallRef.current = null
        setRemoteAuthorId(null)
      }
    }

    ensureConnected().then((hub) => {
      hub.on('ScreenShareStarted', handleStarted)
      hub.on('ScreenShareStopped', handleStopped)
    })

    return () => {
      offIncomingCall()
      ensureConnected().then((hub) => {
        hub.off('ScreenShareStarted', handleStarted)
        hub.off('ScreenShareStopped', handleStopped)
      })
    }
  }, [channelId, localUserId, remoteAuthorId])

  async function handleStartSharing() {
    if (!peerId) {
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      stream.getVideoTracks()[0].addEventListener('ended', handleStopSharing)

      setIsSharing(true)
      setError(null)
      await startScreenShare(channelId, localUserId, peerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar o compartilhamento de tela.')
    }
  }

  function handleStopSharing() {
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    setIsSharing(false)
    stopScreenShare(channelId, localUserId).catch(() => undefined)
  }

  return (
    <div className="screen-share">
      <div className="screen-share-controls">
        <button type="button" onClick={isSharing ? handleStopSharing : handleStartSharing} disabled={!peerId}>
          {isSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
        </button>
        {error && <span className="chat-error">{error}</span>}
      </div>

      <div className="screen-share-videos">
        <video ref={localVideoRef} className="screen-share-video" autoPlay playsInline muted hidden={!isSharing} />
        <video
          ref={remoteVideoRef}
          className="screen-share-video"
          autoPlay
          playsInline
          hidden={!remoteAuthorId}
        />
      </div>
    </div>
  )
}

export default ScreenShare
