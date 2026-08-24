import { useEffect } from 'react'
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

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )
}

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 6.51V5a3 3 0 0 0-5.94-.6" />
      <path d="M5 10a7 7 0 0 0 10.29 6.17" />
      <path d="M17.9 12.9A7 7 0 0 0 19 10" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

function HangupIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12 9c-2.5 0-4.8.6-6.9 1.6a1 1 0 0 0-.5 1.2l1 3a1 1 0 0 0 1.2.6c1-.3 2-.5 3.2-.5v-2.3c0-.4.3-.8.7-.9.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c.4.1.7.5.7.9v2.3c1.2 0 2.2.2 3.2.5a1 1 0 0 0 1.2-.6l1-3a1 1 0 0 0-.5-1.2C16.8 9.6 14.5 9 12 9z" />
    </svg>
  )
}

function ScreenShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M9.5 10.5 12 8l2.5 2.5" />
      <line x1="12" y1="8" x2="12" y2="13" />
    </svg>
  )
}

function VoiceChannel({ serverId, channelId, channelName, localUserId, localUsername }: VoiceChannelProps) {
  const {
    isJoined,
    isConnecting,
    isMuted,
    isSharingScreen,
    isScreenShareSupported,
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

  useEffect(() => {
    joinChannel(serverId, channelId, channelName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, channelId, channelName])

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
        <span>🔊 {channelName}</span>
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
          <span>🖥️ {remoteScreenSharer.username} está compartilhando a tela</span>
          <button type="button" onClick={viewRemoteScreen}>
            Assistir
          </button>
        </div>
      )}

      {isStageMode ? (
        <div className="voice-stage">
          <div className="voice-stage-videos">
            {showLocalStage && (
              <div className="voice-stage-video-box">
                <video ref={localVideoRef} className="voice-stage-video" autoPlay playsInline muted />
                <span className="voice-stage-video-label">Você (compartilhando)</span>
              </div>
            )}
            {showRemoteStage && (
              <div className="voice-stage-video-box">
                <video ref={remoteVideoRef} className="voice-stage-video" autoPlay playsInline />
                <span className="voice-stage-video-label">{remoteScreenSharer?.username}</span>
                <button
                  type="button"
                  className="voice-stage-hide"
                  onClick={hideRemoteScreen}
                  title="Ocultar tela compartilhada"
                  aria-label="Ocultar tela compartilhada"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="voice-stage-participants">
            {isJoined && (
              <div className="voice-chip">
                <span className="voice-avatar-sm" style={{ background: getAvatarColor(localUserId) }}>
                  {getInitials(localUsername)}
                </span>
                <span className="voice-chip-name">{localUsername}</span>
              </div>
            )}
            {participants.map((participant) => (
              <div className="voice-chip" key={participant.peerId}>
                <span className="voice-avatar-sm" style={{ background: getAvatarColor(participant.peerId) }}>
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
              <span className="voice-avatar-lg" style={{ background: getAvatarColor(localUserId) }}>
                {getInitials(localUsername)}
              </span>
              <span className="voice-tile-name">{localUsername}</span>
            </div>
          )}
          {participants.map((participant) => (
            <div className="voice-tile" key={participant.peerId}>
              <span className="voice-avatar-lg" style={{ background: getAvatarColor(participant.peerId) }}>
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
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </button>

          <button
            type="button"
            className="voice-control-btn leave"
            onClick={handleHangup}
            title="Sair da call"
            aria-label="Sair da call"
          >
            <HangupIcon />
          </button>

          <button
            type="button"
            className={`voice-control-btn${isSharingScreen ? ' active' : ''}`}
            onClick={isSharingScreen ? stopScreenShare : startScreenShare}
            disabled={!isSharingScreen && !isScreenShareSupported}
            title={isScreenShareSupported ? 'Compartilhar tela' : 'Compartilhamento de tela não é suportado neste dispositivo'}
            aria-label="Compartilhar tela"
          >
            <ScreenShareIcon />
          </button>
        </div>
      )}
    </div>
  )
}

export default VoiceChannel
