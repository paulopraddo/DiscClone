import { useParams } from 'react-router-dom'
import ChannelList from '../components/ChannelList'
import ChatArea from '../components/ChatArea'
import VoiceChannel from '../components/VoiceChannel'
import { useAuth } from '../contexts/AuthContext'
import { useServers } from '../contexts/ServersContext'

function ChannelPage() {
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>()
  const { user } = useAuth()
  const { servers } = useServers()
  const channel = servers.find((s) => s.id === serverId)?.channels.find((c) => c.id === channelId)

  return (
    <>
      <ChannelList serverId={serverId!} />
      <div className="channel-main">
        {channel?.type === 'voice' && (
          <VoiceChannel channelId={channelId!} channelName={channel.name} localUserId={user!.userId} />
        )}
        <ChatArea channelId={channelId!} channelName={channel?.name ?? ''} localUserId={user!.userId} />
      </div>
    </>
  )
}

export default ChannelPage
