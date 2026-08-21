import { NavLink } from 'react-router-dom'
import { channels, servers } from '../mock/data'

interface ChannelListProps {
  serverId: string
}

function ChannelList({ serverId }: ChannelListProps) {
  const server = servers.find((s) => s.id === serverId)
  const serverChannels = channels.filter((c) => c.serverId === serverId)

  return (
    <nav className="channel-list">
      <h2 className="channel-list-title">{server?.name ?? 'Servidor'}</h2>
      <ul>
        {serverChannels.map((channel) => (
          <li key={channel.id}>
            <NavLink
              to={`/servers/${serverId}/channels/${channel.id}`}
              className={({ isActive }) => `channel-link${isActive ? ' active' : ''}`}
            >
              {channel.type === 'text' ? '#' : '🔊'} {channel.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default ChannelList
