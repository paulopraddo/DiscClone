import { useParams } from 'react-router-dom'
import ChannelList from '../components/ChannelList'
import ChatArea from '../components/ChatArea'
import ScreenShare from '../components/ScreenShare'
import VoiceChannel from '../components/VoiceChannel'
import { useAuth } from '../contexts/AuthContext'
import { usePeerId } from '../hooks/usePeerId'
import { channels } from '../mock/data'

function ChannelPage() {
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>()
  const { user } = useAuth()
  const { peerId } = usePeerId()
  const channel = channels.find((c) => c.id === channelId)

  return (
    <>
      <ChannelList serverId={serverId!} />
      <div className="channel-main">
        {channel?.type === 'voice' ? (
          <VoiceChannel channelId={channelId!} channelName={channel.name} peerId={peerId} />
        ) : (
          <>
            <ScreenShare channelId={channelId!} localUserId={user!.userId} peerId={peerId} />
            <ChatArea channelId={channelId!} localUserId={user!.userId} peerId={peerId} />
          </>
        )}
      </div>
    </>
  )
}

export default ChannelPage
