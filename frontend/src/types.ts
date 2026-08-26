export interface Message {
  id: string
  channelId: string
  authorId: string
  author: string
  content: string
  sentAt: string
  editedAt: string | null
}
