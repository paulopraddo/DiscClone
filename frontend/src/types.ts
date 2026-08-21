export interface Server {
  id: string
  name: string
}

export interface Channel {
  id: string
  serverId: string
  name: string
  type: 'text' | 'voice'
}

export interface Message {
  id: string
  channelId: string
  author: string
  content: string
  sentAt: string
}
