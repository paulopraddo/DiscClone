import { useState } from 'react'
import { channels, messages as mockMessages } from '../mock/data'
import type { Message } from '../types'

interface ChatAreaProps {
  channelId: string
}

function ChatArea({ channelId }: ChatAreaProps) {
  const channel = channels.find((c) => c.id === channelId)
  const [messages, setMessages] = useState<Message[]>(() =>
    mockMessages.filter((m) => m.channelId === channelId),
  )
  const [draft, setDraft] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!draft.trim()) {
      return
    }

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        channelId,
        author: 'Você',
        content: draft,
        sentAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setDraft('')
  }

  return (
    <section className="chat-area">
      <header className="chat-header">#{channel?.name ?? ''}</header>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="chat-message">
            <span className="chat-message-author">{message.author}</span>
            <span className="chat-message-time">{message.sentAt}</span>
            <p className="chat-message-content">{message.content}</p>
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={`Conversar em #${channel?.name ?? ''}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </form>
    </section>
  )
}

export default ChatArea
