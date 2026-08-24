import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ServersProvider } from '../contexts/ServersContext'
import { MobileNavProvider, useMobileNav } from '../contexts/MobileNavContext'
import { VoiceCallProvider } from '../contexts/VoiceCallContext'
import ServerRail from './ServerRail'
import VoiceCallStatusBar from './VoiceCallStatusBar'

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
      <VoiceCallStatusBar />
    </div>
  )
}

function Layout() {
  return (
    <ServersProvider>
      <MobileNavProvider>
        <VoiceCallProvider>
          <LayoutContent />
        </VoiceCallProvider>
      </MobileNavProvider>
    </ServersProvider>
  )
}

export default Layout
