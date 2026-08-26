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
  const server = servers.find((s) => s.id === serverId)
  const channel = server?.channels.find((c) => c.id === channelId)
  const isServerOwner = server?.ownerId === user?.userId

  return (
    <>
      <ChannelList serverId={serverId!} />
      <div className="channel-main">
        {channel?.type === 'voice' ? (
          <VoiceChannel
            key={channelId}
            serverId={serverId!}
            channelId={channelId!}
            channelName={channel.name}
            localUserId={user!.userId}
            localUsername={user!.username}
          />
        ) : (
          <ChatArea
            channelId={channelId!}
            channelName={channel?.name ?? ''}
            localUserId={user!.userId}
            isServerOwner={isServerOwner}
          />
        )}
      </div>
    </>
  )
}

export default ChannelPage
