import { Outlet } from 'react-router-dom'
import ServerRail from './ServerRail'

function Layout() {
  return (
    <div className="app-layout">
      <ServerRail />
      <Outlet />
    </div>
  )
}

export default Layout
