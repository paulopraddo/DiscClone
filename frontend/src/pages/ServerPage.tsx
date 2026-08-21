import { useParams } from 'react-router-dom'
import ChannelList from '../components/ChannelList'

function ServerPage() {
  const { serverId } = useParams<{ serverId: string }>()

  return (
    <>
      <ChannelList serverId={serverId!} />
      <div className="empty-state">
        <p>Selecione um canal para começar a conversar.</p>
      </div>
    </>
  )
}

export default ServerPage
