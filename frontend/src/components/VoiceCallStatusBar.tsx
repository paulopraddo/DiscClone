import { Mic, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useVoiceCall } from '../contexts/VoiceCallContext'

function VoiceCallStatusBar() {
  const { active, isJoined, leaveCall } = useVoiceCall()
  const location = useLocation()
  const navigate = useNavigate()

  if (!active || !isJoined) {
    return null
  }

  const voicePath = `/servers/${active.serverId}/channels/${active.channelId}`

  if (location.pathname === voicePath) {
    return null
  }

  return (
    <button type="button" className="voice-status-bar" onClick={() => navigate(voicePath)}>
      <span className="voice-status-icon">
        <Mic size={14} />
      </span>
      <span className="voice-status-text">Conectado em #{active.channelName}</span>
      <span
        className="voice-status-leave"
        role="button"
        aria-label="Sair da call"
        title="Sair da call"
        onClick={(event) => {
          event.stopPropagation()
          leaveCall()
        }}
      >
        <X size={12} />
      </span>
    </button>
  )
}

export default VoiceCallStatusBar
