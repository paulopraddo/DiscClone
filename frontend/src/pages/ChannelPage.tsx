import { useParams } from 'react-router-dom'
import ChannelList from '../components/ChannelList'
import ChatArea from '../components/ChatArea'
import ScreenShare from '../components/ScreenShare'
import { usePeerId } from '../hooks/usePeerId'
import { getLocalUserId } from '../lib/localUser'

function ChannelPage() {
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>()
  const localUserId = getLocalUserId()
  const { peerId } = usePeerId()

  return (
    <>
      <ChannelList serverId={serverId!} />
      <div className="channel-main">
        <ScreenShare channelId={channelId!} localUserId={localUserId} peerId={peerId} />
        <ChatArea channelId={channelId!} localUserId={localUserId} peerId={peerId} />
      </div>
    </>
  )
}

export default ChannelPage
