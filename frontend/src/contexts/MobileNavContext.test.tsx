import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MobileNavProvider, useMobileNav } from './MobileNavContext'

function renderNav() {
  return renderHook(() => useMobileNav(), { wrapper: MobileNavProvider })
}

describe('MobileNavContext', () => {
  it('começa fechado', () => {
    const { result } = renderNav()

    expect(result.current.isDrawerOpen).toBe(false)
  })

  it('openDrawer abre o menu', () => {
    const { result } = renderNav()

    act(() => result.current.openDrawer())

    expect(result.current.isDrawerOpen).toBe(true)
  })

  it('closeDrawer fecha o menu', () => {
    const { result } = renderNav()

    act(() => result.current.openDrawer())
    act(() => result.current.closeDrawer())

    expect(result.current.isDrawerOpen).toBe(false)
  })

  it('toggleDrawer alterna o estado', () => {
    const { result } = renderNav()

    act(() => result.current.toggleDrawer())
    expect(result.current.isDrawerOpen).toBe(true)

    act(() => result.current.toggleDrawer())
    expect(result.current.isDrawerOpen).toBe(false)
  })

  it('useMobileNav fora do provider lança erro', () => {
    expect(() => renderHook(() => useMobileNav())).toThrow(
      'useMobileNav deve ser usado dentro de MobileNavProvider',
    )
  })
})
