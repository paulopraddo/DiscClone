import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ServersProvider } from '../contexts/ServersContext'
import { MobileNavProvider, useMobileNav } from '../contexts/MobileNavContext'
import ServerRail from './ServerRail'

function LayoutContent() {
  const { isDrawerOpen, closeDrawer, toggleDrawer } = useMobileNav()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.includes('/channels/')) {
      closeDrawer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <div className={`app-layout${isDrawerOpen ? ' drawer-open' : ''}`}>
      <button type="button" className="mobile-menu-button" onClick={toggleDrawer} aria-label="Abrir menu">
        ☰
      </button>

      {isDrawerOpen && <div className="mobile-backdrop" onClick={closeDrawer} />}

      <ServerRail />
      <Outlet />
    </div>
  )
}

function Layout() {
  return (
    <ServersProvider>
      <MobileNavProvider>
        <LayoutContent />
      </MobileNavProvider>
    </ServersProvider>
  )
}

export default Layout
