import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMyServers, login, setApiAuthToken } from './api'

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

describe('api request()', () => {
  beforeEach(() => {
    setApiAuthToken(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envia POST com corpo em JSON e sem Authorization quando não autenticado', async () => {
    const fetchMock = mockFetchOnce({ userId: '1', username: 'joao', token: 'tok' })
    vi.stubGlobal('fetch', fetchMock)

    await login('joao@example.com', 'senha1234')

    const [, options] = fetchMock.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ email: 'joao@example.com', password: 'senha1234' })
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('inclui o header Authorization depois de setApiAuthToken', async () => {
    setApiAuthToken('meu-token')
    const fetchMock = mockFetchOnce([])
    vi.stubGlobal('fetch', fetchMock)

    await getMyServers()

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer meu-token')
  })

  it('em erro com lista de mensagens, junta elas numa unica Error', async () => {
    const fetchMock = mockFetchOnce(['Erro um.', 'Erro dois.'], false, 400)
    vi.stubGlobal('fetch', fetchMock)

    await expect(login('joao@example.com', 'errada')).rejects.toThrow('Erro um. Erro dois.')
  })

  it('em erro sem corpo parseável, usa mensagem genérica', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('não é json')),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(login('joao@example.com', 'errada')).rejects.toThrow('Falha na requisição.')
  })

  it('retorna os dados parseados quando a resposta é ok', async () => {
    const fetchMock = mockFetchOnce([{ id: '1', name: 'Servidor', channels: [] }])
    vi.stubGlobal('fetch', fetchMock)

    const servers = await getMyServers()

    expect(servers).toEqual([{ id: '1', name: 'Servidor', channels: [] }])
  })
})
