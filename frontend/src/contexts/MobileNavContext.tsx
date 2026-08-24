import { createContext, useContext, useState, type ReactNode } from 'react'

interface MobileNavContextValue {
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

const MobileNavContext = createContext<MobileNavContextValue | undefined>(undefined)

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const value: MobileNavContextValue = {
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    toggleDrawer: () => setIsDrawerOpen((current) => !current),
  }

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
}

export function useMobileNav() {
  const context = useContext(MobileNavContext)

  if (!context) {
    throw new Error('useMobileNav deve ser usado dentro de MobileNavProvider')
  }

  return context
}
