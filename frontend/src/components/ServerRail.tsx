import { NavLink } from 'react-router-dom'
import { servers } from '../mock/data'

function ServerRail() {
  return (
    <nav className="server-rail">
      <NavLink to="/" end className="server-icon home-icon">
        DC
      </NavLink>
      <div className="server-rail-divider" />
      {servers.map((server) => (
        <NavLink
          key={server.id}
          to={`/servers/${server.id}`}
          className={({ isActive }) => `server-icon${isActive ? ' active' : ''}`}
          title={server.name}
        >
          {server.name.slice(0, 2).toUpperCase()}
        </NavLink>
      ))}
    </nav>
  )
}

export default ServerRail
