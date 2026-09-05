import { Maximize2, Mic, MicOff, Minimize2, Monitor, MonitorUp, PhoneOff, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoiceCall } from '../contexts/VoiceCallContext'
import { getAvatarColor, getInitials } from '../lib/avatar'

interface VoiceChannelProps {
  serverId: string
  channelId: string
  channelName: string
  localUserId: string
  localUsername: string
}

function VoiceChannel({ serverId, channelId, channelName, localUserId, localUsername }: VoiceChannelProps) {
  const {
    isJoined,
    isConnecting,
    isMuted,
    isSharingScreen,
    isScreenShareSupported,
    isLocalSpeaking,
    speakingPeerIds,
    participants,
    remoteScreenSharer,
    remoteScreenShare,
    isViewingRemoteScreen,
    localScreenStream,
    error,
    localVideoRef,
    remoteVideoRef,
    joinChannel,
    retryJoin,
    leaveCall,
    toggleMute,
    startScreenShare,
    stopScreenShare,
    viewRemoteScreen,
    hideRemoteScreen,
  } = useVoiceCall()
  const navigate = useNavigate()
  const localStageBoxRef = useRef<HTMLDivElement>(null)
  const remoteStageBoxRef = useRef<HTMLDivElement>(null)
  const [fullscreenTarget, setFullscreenTarget] = useState<'local' | 'remote' | null>(null)

  useEffect(() => {
    joinChannel(serverId, channelId, channelName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, channelId, channelName])

  useEffect(() => {
    function handleFullscreenChange() {
      if (document.fullscreenElement === localStageBoxRef.current) {
        setFullscreenTarget('local')
      } else if (document.fullscreenElement === remoteStageBoxRef.current) {
        setFullscreenTarget('remote')
      } else {
        setFullscreenTarget(null)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  async function toggleFullscreen(target: 'local' | 'remote') {
    if (fullscreenTarget === target) {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => undefined)
      }
      return
    }

    const box = target === 'local' ? localStageBoxRef.current : remoteStageBoxRef.current

    if (box?.requestFullscreen) {
      try {
        await box.requestFullscreen()
        return
      } catch {
        // cai para o fallback do iOS abaixo
      }
    }

    // Safari no iOS não implementa a Fullscreen API em elementos genéricos,
    // só no próprio <video> via uma API nativa dele.
    const video = target === 'local' ? localVideoRef.current : remoteVideoRef.current
    const iosVideo = video as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    iosVideo?.webkitEnterFullscreen?.()
  }

  function handleHangup() {
    leaveCall()
    navigate(`/servers/${serverId}`)
  }

  useEffect(() => {
    if (localVideoRef.current && localScreenStream) {
      localVideoRef.current.srcObject = localScreenStream
    }
  }, [localScreenStream, localVideoRef])

  useEffect(() => {
    if (remoteVideoRef.current && remoteScreenShare && isViewingRemoteScreen) {
      remoteVideoRef.current.srcObject = remoteScreenShare.stream
    }
  }, [remoteScreenShare, isViewingRemoteScreen, remoteVideoRef])

  const showLocalStage = isSharingScreen && !!localScreenStream
  const showRemoteStage = isViewingRemoteScreen && !!remoteScreenShare
  const isStageMode = showLocalStage || showRemoteStage

  return (
    <div className="voice-fullscreen">
      <header className="voice-fullscreen-header">
        <Mic size={16} /> {channelName}
      </header>

      {error && (
        <div className="chat-error voice-error">
          <span>{error}</span>
          <button type="button" onClick={retryJoin}>
            Tentar novamente
          </button>
        </div>
      )}

      {remoteScreenSharer && !isViewingRemoteScreen && (
        <div className="voice-share-prompt">
          <span>
            <Monitor size={15} /> {remoteScreenSharer.username} está compartilhando a tela
          </span>
          <button type="button" onClick={viewRemoteScreen}>
            Assistir
          </button>
        </div>
      )}

      {isStageMode ? (
        <div className="voice-stage">
          <div className="voice-stage-videos">
            {showLocalStage && (
              <div className="voice-stage-video-box" ref={localStageBoxRef}>
                <video ref={localVideoRef} className="voice-stage-video" autoPlay playsInline muted />
                <span className="voice-stage-video-label">Você (compartilhando)</span>
                <button
                  type="button"
                  className="voice-stage-fullscreen voice-stage-fullscreen--alone"
                  onClick={() => toggleFullscreen('local')}
                  title={fullscreenTarget === 'local' ? 'Sair da tela cheia' : 'Ver em tela cheia'}
                  aria-label={fullscreenTarget === 'local' ? 'Sair da tela cheia' : 'Ver em tela cheia'}
                >
                  {fullscreenTarget === 'local' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            )}
            {showRemoteStage && (
              <div className="voice-stage-video-box" ref={remoteStageBoxRef}>
                <video ref={remoteVideoRef} className="voice-stage-video" autoPlay playsInline />
                <span className="voice-stage-video-label">{remoteScreenSharer?.username}</span>
                <button
                  type="button"
                  className="voice-stage-fullscreen"
                  onClick={() => toggleFullscreen('remote')}
                  title={fullscreenTarget === 'remote' ? 'Sair da tela cheia' : 'Ver em tela cheia'}
                  aria-label={fullscreenTarget === 'remote' ? 'Sair da tela cheia' : 'Ver em tela cheia'}
                >
                  {fullscreenTarget === 'remote' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  className="voice-stage-hide"
                  onClick={hideRemoteScreen}
                  title="Ocultar tela compartilhada"
                  aria-label="Ocultar tela compartilhada"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="voice-stage-participants">
            {isJoined && (
              <div className="voice-chip">
                <span
                  className={`voice-avatar-sm${isLocalSpeaking ? ' speaking' : ''}`}
                  style={{ background: getAvatarColor(localUserId) }}
                >
                  {getInitials(localUsername)}
                </span>
                <span className="voice-chip-name">{localUsername}</span>
              </div>
            )}
            {participants.map((participant) => (
              <div className="voice-chip" key={participant.peerId}>
                <span
                  className={`voice-avatar-sm${speakingPeerIds.has(participant.peerId) ? ' speaking' : ''}`}
                  style={{ background: getAvatarColor(participant.peerId) }}
                >
                  {getInitials(participant.username)}
                </span>
                <span className="voice-chip-name">{participant.username}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="voice-grid">
          {isJoined && (
            <div className="voice-tile">
              <span
                className={`voice-avatar-lg${isLocalSpeaking ? ' speaking' : ''}`}
                style={{ background: getAvatarColor(localUserId) }}
              >
                {getInitials(localUsername)}
              </span>
              <span className="voice-tile-name">{localUsername}</span>
            </div>
          )}
          {participants.map((participant) => (
            <div className="voice-tile" key={participant.peerId}>
              <span
                className={`voice-avatar-lg${speakingPeerIds.has(participant.peerId) ? ' speaking' : ''}`}
                style={{ background: getAvatarColor(participant.peerId) }}
              >
                {getInitials(participant.username)}
              </span>
              <span className="voice-tile-name">{participant.username}</span>
            </div>
          ))}
          {!isJoined && isConnecting && <p className="voice-connecting">Conectando...</p>}
        </div>
      )}

      {isJoined && (
        <div className="voice-controls">
          <button
            type="button"
            className={`voice-control-btn${isMuted ? ' active-warning' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Ativar microfone' : 'Mutar microfone'}
            aria-label={isMuted ? 'Ativar microfone' : 'Mutar microfone'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            type="button"
            className="voice-control-btn leave"
            onClick={handleHangup}
            title="Sair da call"
            aria-label="Sair da call"
          >
            <PhoneOff size={20} />
          </button>

          <button
            type="button"
            className={`voice-control-btn${isSharingScreen ? ' active' : ''}`}
            onClick={isSharingScreen ? stopScreenShare : startScreenShare}
            disabled={!isSharingScreen && !isScreenShareSupported}
            title={isScreenShareSupported ? 'Compartilhar tela' : 'Compartilhamento de tela não é suportado neste dispositivo'}
            aria-label="Compartilhar tela"
          >
            <MonitorUp size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default VoiceChannel
