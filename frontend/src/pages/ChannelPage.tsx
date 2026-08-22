import { useParams } from 'react-router-dom'
import ChannelList from '../components/ChannelList'
import ChatArea from '../components/ChatArea'
import VoiceChannel from '../components/VoiceChannel'
import { useAuth } from '../contexts/AuthContext'
import { channels } from '../mock/data'

function ChannelPage() {
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>()
  const { user } = useAuth()
  const channel = channels.find((c) => c.id === channelId)

  return (
    <>
      <ChannelList serverId={serverId!} />
      <div className="channel-main">
        {channel?.type === 'voice' && (
          <VoiceChannel channelId={channelId!} channelName={channel.name} localUserId={user!.userId} />
        )}
        <ChatArea channelId={channelId!} localUserId={user!.userId} />
      </div>
    </>
  )
}

export default ChannelPage
