import { useParams } from 'react-router-dom'
import ChannelList from '../components/ChannelList'
import ChatArea from '../components/ChatArea'

function ChannelPage() {
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>()

  return (
    <>
      <ChannelList serverId={serverId!} />
      <ChatArea channelId={channelId!} />
    </>
  )
}

export default ChannelPage
