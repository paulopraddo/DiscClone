import { Outlet } from 'react-router-dom'
import { ServersProvider } from '../contexts/ServersContext'
import ServerRail from './ServerRail'

function Layout() {
  return (
    <ServersProvider>
      <div className="app-layout">
        <ServerRail />
        <Outlet />
      </div>
    </ServersProvider>
  )
}

export default Layout
