import { useParams } from 'react-router-dom'

function ServerPage() {
  const { serverId } = useParams<{ serverId: string }>()

  return (
    <div>
      <h1>Servidor {serverId}</h1>
    </div>
  )
}

export default ServerPage
