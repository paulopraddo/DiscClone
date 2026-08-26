import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ServersProvider, useServers } from './ServersContext'
import * as api from '../lib/api'

vi.mock('../lib/api')

function renderServers() {
  return renderHook(() => useServers(), { wrapper: ServersProvider })
}

describe('ServersContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carrega os servidores ao montar', async () => {
    vi.mocked(api.getMyServers).mockResolvedValue([{ id: '1', name: 'Servidor', ownerId: 'owner-1', channels: [] }])
    const { result } = renderServers()

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.servers).toEqual([{ id: '1', name: 'Servidor', ownerId: 'owner-1', channels: [] }])
    expect(result.current.error).toBeNull()
  })

  it('define uma mensagem de erro quando a busca falha', async () => {
    vi.mocked(api.getMyServers).mockRejectedValue(new Error('falha de rede'))
    const { result } = renderServers()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('falha de rede')
    expect(result.current.servers).toEqual([])
  })

  it('createServer chama a api e recarrega a lista', async () => {
    vi.mocked(api.getMyServers)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: '1', name: 'Novo', ownerId: 'owner-1', channels: [] }])
    vi.mocked(api.createServer).mockResolvedValue('1')

    const { result } = renderServers()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createServer('Novo')
    })

    expect(api.createServer).toHaveBeenCalledWith('Novo')
    expect(result.current.servers).toEqual([{ id: '1', name: 'Novo', ownerId: 'owner-1', channels: [] }])
  })

  it('joinServer chama a api com o id do servidor', async () => {
    vi.mocked(api.getMyServers).mockResolvedValue([])
    vi.mocked(api.joinServer).mockResolvedValue(undefined)

    const { result } = renderServers()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.joinServer('server-1')
    })

    expect(api.joinServer).toHaveBeenCalledWith('server-1')
  })

  it('renameServer chama a api com o id do servidor e o novo nome', async () => {
    vi.mocked(api.getMyServers).mockResolvedValue([])
    vi.mocked(api.renameServer).mockResolvedValue(undefined)

    const { result } = renderServers()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.renameServer('server-1', 'Novo Nome')
    })

    expect(api.renameServer).toHaveBeenCalledWith('server-1', 'Novo Nome')
  })

  it('leaveServer chama a api com o id do servidor', async () => {
    vi.mocked(api.getMyServers).mockResolvedValue([])
    vi.mocked(api.leaveServer).mockResolvedValue(undefined)

    const { result } = renderServers()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.leaveServer('server-1')
    })

    expect(api.leaveServer).toHaveBeenCalledWith('server-1')
  })

  it('deleteServer chama a api com o id do servidor', async () => {
    vi.mocked(api.getMyServers).mockResolvedValue([])
    vi.mocked(api.deleteServer).mockResolvedValue(undefined)

    const { result } = renderServers()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.deleteServer('server-1')
    })

    expect(api.deleteServer).toHaveBeenCalledWith('server-1')
  })

  it('createChannel chama a api com servidor, nome e tipo', async () => {
    vi.mocked(api.getMyServers).mockResolvedValue([])
    vi.mocked(api.createChannel).mockResolvedValue('channel-1')

    const { result } = renderServers()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createChannel('server-1', 'geral', 'text')
    })

    expect(api.createChannel).toHaveBeenCalledWith('server-1', 'geral', 'text')
  })

  it('deleteChannel chama a api com servidor e canal', async () => {
    vi.mocked(api.getMyServers).mockResolvedValue([])
    vi.mocked(api.deleteChannel).mockResolvedValue(undefined)

    const { result } = renderServers()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.deleteChannel('server-1', 'channel-1')
    })

    expect(api.deleteChannel).toHaveBeenCalledWith('server-1', 'channel-1')
  })
})
