import type { Channel, Message, Server } from '../types'

export const servers: Server[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Estudos' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Amigos' },
]

export const channels: Channel[] = [
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', serverId: '11111111-1111-1111-1111-111111111111', name: 'geral', type: 'text' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', serverId: '11111111-1111-1111-1111-111111111111', name: 'duvidas', type: 'text' },
  { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', serverId: '11111111-1111-1111-1111-111111111111', name: 'Sala de Voz', type: 'voice' },
  { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', serverId: '22222222-2222-2222-2222-222222222222', name: 'geral', type: 'text' },
  { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', serverId: '22222222-2222-2222-2222-222222222222', name: 'games', type: 'text' },
]

export const messages: Message[] = [
  {
    id: '1',
    channelId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    author: 'Paulo',
    content: 'Bem-vindo ao servidor!',
    sentAt: '10:00',
  },
  {
    id: '2',
    channelId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    author: 'Ana',
    content: 'Oi pessoal 👋',
    sentAt: '10:02',
  },
]
