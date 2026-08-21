import type { Channel, Message, Server } from '../types'

export const servers: Server[] = [
  { id: '1', name: 'Estudos' },
  { id: '2', name: 'Amigos' },
]

export const channels: Channel[] = [
  { id: '1', serverId: '1', name: 'geral', type: 'text' },
  { id: '2', serverId: '1', name: 'duvidas', type: 'text' },
  { id: '3', serverId: '1', name: 'Sala de Voz', type: 'voice' },
  { id: '4', serverId: '2', name: 'geral', type: 'text' },
  { id: '5', serverId: '2', name: 'games', type: 'text' },
]

export const messages: Message[] = [
  { id: '1', channelId: '1', author: 'Paulo', content: 'Bem-vindo ao servidor!', sentAt: '10:00' },
  { id: '2', channelId: '1', author: 'Ana', content: 'Oi pessoal 👋', sentAt: '10:02' },
]
