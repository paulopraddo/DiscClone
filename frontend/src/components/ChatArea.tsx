import { useEffect, useState } from 'react'
import { channels, messages as mockMessages } from '../mock/data'
import { ensureConnected, joinChannel, leaveChannel, sendMessage } from '../services/chatHub'
import type { Message } from '../types'

interface ChatAreaProps {
  channelId: string
  localUserId: string
  peerId: string | null
}

interface ReceivedMessage {
  messageId: string
  channelId: string
  authorId: string
  content: string
  sentAt: string
}

function ChatArea({ channelId, localUserId, peerId }: ChatAreaProps) {
  const channel = channels.find((c) => c.id === channelId)
  const [messages, setMessages] = useState<Message[]>(() =>
    mockMessages.filter((m) => m.channelId === channelId),
  )
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    function handleReceiveMessage(payload: ReceivedMessage) {
      if (payload.channelId !== channelId) {
        return
      }

      setMessages((current) => [
        ...current,
        {
          id: payload.messageId,
          channelId: payload.channelId,
          author: payload.authorId === localUserId ? 'Você' : payload.authorId,
          content: payload.content,
          sentAt: new Date(payload.sentAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ])
    }

    function handleMessageRejected(reasons: string[]) {
      if (active) {
        setError(reasons.join(' '))
      }
    }

    ensureConnected()
      .then((hub) => {
        hub.on('ReceiveMessage', handleReceiveMessage)
        hub.on('MessageRejected', handleMessageRejected)
        return joinChannel(channelId)
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Falha ao conectar ao servidor.')
        }
      })

    return () => {
      active = false
      leaveChannel(channelId).catch(() => undefined)
      ensureConnected().then((hub) => {
        hub.off('ReceiveMessage', handleReceiveMessage)
        hub.off('MessageRejected', handleMessageRejected)
      })
    }
  }, [channelId, localUserId])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!draft.trim()) {
      return
    }

    setError(null)
    sendMessage(channelId, localUserId, draft).catch((err) => {
      setError(err instanceof Error ? err.message : 'Falha ao enviar mensagem.')
    })
    setDraft('')
  }

  return (
    <section className="chat-area">
      <header className="chat-header">
        <span>#{channel?.name ?? ''}</span>
        <span className="peer-status" title={peerId ?? 'Conectando ao PeerJS...'}>
          {peerId ? '🟢 P2P pronto' : '⚪ Conectando P2P...'}
        </span>
      </header>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="chat-message">
            <span className="chat-message-author">{message.author}</span>
            <span className="chat-message-time">{message.sentAt}</span>
            <p className="chat-message-content">{message.content}</p>
          </div>
        ))}
      </div>

      {error && <div className="chat-error">{error}</div>}

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
